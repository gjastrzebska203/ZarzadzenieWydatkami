function simulateGrowth(current, rate, years) {
  return current * Math.pow(1 + rate, years);
}

function yearsBetweenDates(startDate, endDate) {
  const ms = new Date(endDate) - new Date(startDate);
  return ms / (1000 * 60 * 60 * 24 * 365.25);
}

module.exports = {
  simulateGrowth,
  yearsBetweenDates,
};
