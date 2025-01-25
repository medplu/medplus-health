const Schedule = require('../models/schedule.model');

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
      schedule.schedules.get(day)[slotIndex] = { ...schedule.schedules.get(day)[slotIndex], ...slotData };

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
    const { userId } = req.params;
    const schedules = await Schedule.find({ userId });

    // Handle recurrence logic when retrieving schedules
    const processedSchedules = schedules.map(schedule => {
      const processed = { ...schedule._doc };
      Object.keys(processed.schedules).forEach(day => {
        processed.schedules[day] = processed.schedules[day].map(slot => {
          if (slot.recurrence === 'Daily') {
            return weekDays.map(recDay => ({ ...slot, day: recDay }));
          } else if (slot.recurrence === 'Weekly') {
            // Handle weekly recurrence
            const dayIndex = weekDays.indexOf(day);
            return weekDays.filter((_, index) => index % 7 === dayIndex % 7).map(recDay => ({ ...slot, day: recDay }));
          }
          return slot;
        }).flat();
      });
      return processed;
    });

    res.status(200).json(processedSchedules);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving schedules', error });
  }
};
