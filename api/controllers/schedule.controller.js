const Schedule = require('../models/schedule.model');

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

exports.addSchedule = async (req, res) => {
  try {
    const { userId, schedules } = req.body;

    // Store recurrence pattern without duplicating slots
    const newSchedule = new Schedule({ userId, schedules });
    await newSchedule.save();
    res.status(201).json({ message: 'Schedule added successfully', schedule: newSchedule });
  } catch (error) {
    res.status(500).json({ message: 'Error adding schedule', error });
  }
};

exports.updateSlot = async (req, res) => {
  try {
    const { userId, day, slotIndex, slotData } = req.body;
    const schedule = await Schedule.findOne({ userId });
    if (schedule) {
      schedule.schedules[day][slotIndex] = { ...schedule.schedules[day][slotIndex], ...slotData };

      // Store recurrence pattern without duplicating slots
      await schedule.save();
      res.status(200).json({ message: 'Slot updated successfully', schedule });
    } else {
      res.status(404).json({ message: 'Schedule not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating slot', error });
  }
};

exports.getSchedules = async (req, res) => {
  try {
    const { doctorId } = req.params;
    console.log('Fetching schedule for doctorId:', doctorId); // Log the doctorId

    // Fetch the schedule from the database
    const schedule = await Schedule.findOne({ userId: doctorId });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    console.log('Retrieved schedule:', schedule); // Log the retrieved schedule

    // Convert the Mongoose document to a plain object
    const processedSchedule = schedule.toObject();

    // Convert the schedules Map to a plain object (if necessary)
    if (processedSchedule.schedules instanceof Map) {
      processedSchedule.schedules = Object.fromEntries(processedSchedule.schedules);
    }

    // Simplify the response: Filter available slots and handle recurrence
    const simplifiedResponse = {};

    Object.keys(processedSchedule.schedules).forEach(day => {
      // Filter available and bookable slots
      const availableSlots = processedSchedule.schedules[day].filter(
        slot => slot.isAvailable && slot.isBookable
      );

      // Handle recurrence logic
      const slotsWithRecurrence = availableSlots.map(slot => {
        if (slot.recurrence === 'Daily') {
          const daysInMonth = 30; // Process for a month
          const dayIndex = weekDays.indexOf(day);
          return Array.from({ length: daysInMonth }, (_, i) => {
            const recDay = weekDays[(dayIndex + i) % 7];
            return { ...slot, day: recDay };
          });
        } else if (slot.recurrence === 'Weekly') {
          // Handle weekly recurrence
          const dayIndex = weekDays.indexOf(day);
          return weekDays
            .filter((_, index) => index % 7 === dayIndex % 7)
            .map(recDay => ({ ...slot, day: recDay }));
        }
        return { ...slot, day };
      }).flat();

      // Add the processed slots to the simplified response
      simplifiedResponse[day] = slotsWithRecurrence;
    });

    // Send the simplified response
    res.status(200).json(simplifiedResponse);
  } catch (error) {
    console.error('Error retrieving schedules:', error); // Log the error
    res.status(500).json({ message: 'Error retrieving schedules', error });
  }
};
