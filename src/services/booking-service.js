const axios = require("axios");
const { BookingRepository } = require("../repositories");
const db = require("../models");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const { ServerConfig } = require("../config");

async function createBooking(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const flight = await axios.get(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`,
    );
    const flightData = flight.data.data;
    if (data.noOfSeats > flightData.totalSeats) {
      throw new AppError(
        "Not enough seats available",
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
    const totalBillingAmount = data.noOfSeats * flightData.price;
    console.log(totalBillingAmount);
    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
module.exports = { createBooking };
