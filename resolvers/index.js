const Room = require("../models/room");
const Customer = require("../models/customer");
const Booking = require("../models/booking");

module.exports = {
  Query: {
    rooms: async (_, { type, minPrice, maxPrice }) => {
      const query = {};
      if (type) query.type = type;
      if (minPrice || maxPrice) {
        query.pricePerNight = {};
        if (minPrice) query.pricePerNight.$gte = minPrice;
        if (maxPrice) query.pricePerNight.$lte = maxPrice;
      }
      return await Room.find(query);
    },
    customers: async () => await Customer.find(),
    bookings: async (_, { status }) => {
      return status ? await Booking.find({ status }).populate('room') : await Booking.find().populate('room');
    },
  },
  Mutation: {
    createRoom: async (_, { name, type, pricePerNight, features }) => {
      if (!name) throw new Error("El nombre de la habitación es obligatorio.");
      return await Room.create({ name, type, pricePerNight, features });
    },
    createCustomer: async (_, { name, email, phone }) => {
      return await Customer.create({ name, email, phone });
    },
    createBooking: async (_, { customerId, roomId, startDate, endDate }) => {
      const room = await Room.findById(roomId);
      if (!room) throw new Error("Habitación no encontrada.");

      // Calcular el número de noches entre startDate y endDate
      const start = new Date(startDate);
      const end = new Date(endDate);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      if (nights <= 0) throw new Error("La fecha de fin debe ser posterior a la fecha de inicio.");

      // Verificar si ya existe una reserva que se solape con las fechas solicitadas
      const overlappingBookings = await Booking.find({
        room: roomId,
        $or: [
          { startDate: { $lt: end }, endDate: { $gt: start } }, // Solapamiento de fechas
        ]
      });

      if (overlappingBookings.length > 0) {
        throw new Error("La habitación no está disponible en las fechas seleccionadas.");
      }

      // Calcular el precio total
      let totalPrice = nights * room.pricePerNight;
      if (nights > 7) totalPrice *= 0.9; // Aplicar descuento del 10% si la reserva es mayor a 7 noches

      // Actualizar disponibilidad de la habitación
      room.availability = false;
      await room.save();

      // Crear la reserva
      return await Booking.create({
        customer: customerId,
        room: roomId,
        startDate,
        endDate,
        nights,
        totalPrice,
        status: "pending",
      });
    },

    updateBooking: async (_, { bookingId, status }) => {
      const booking = await Booking.findById(bookingId).populate('room', 'name'); // Asegurarse de que la habitación tenga el campo 'name'
      if (!booking) throw new Error("Reserva no encontrada.");

      // Actualizar el estado de la reserva
      booking.status = status;
      await booking.save();

      // Si la reserva es cancelada, actualizar la disponibilidad de la habitación
      if (status === "cancelled") {
        const room = booking.room;
        room.availability = true;
        await room.save();
      }

      return booking;
    },

    deleteBooking: async (_, { bookingId }) => {
      const booking = await Booking.findByIdAndDelete(bookingId);
      if (!booking) throw new Error("Reserva no encontrada.");
      const room = await Room.findById(booking.room);
      room.availability = true;
      await room.save();
      return "Reserva eliminada correctamente.";
    },
  },
};
