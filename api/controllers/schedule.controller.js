const Schedule = require('../models/schedule.model');

exports.addSchedule = async (req, res) => {
  try {
    const { userId, professionalId, slots } = req.body; // Include professionalId and slots in the request body

    // Store the schedule with the provided slots
    const newSchedule = new Schedule({ userId, professionalId, slots }); // Save professionalId and slots in the document
    await newSchedule.save();
    res.status(201).json({ message: 'Schedule added successfully', schedule: newSchedule });
  } catch (error) {
    res.status(500).json({ message: 'Error adding schedule', error });
  }
};

exports.updateSlot = async (req, res) => {
  try {
    const { userId, slotId, slotData } = req.body;
    const schedule = await Schedule.findOne({ userId });
    if (schedule) {
      const slot = schedule.slots.id(slotId);
      if (slot) {
        Object.assign(slot, slotData); // Update the slot with the provided data
        await schedule.save();
        res.status(200).json({ message: 'Slot updated successfully', schedule });
      } else {
        res.status(404).json({ message: 'Slot not found' });
      }
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
    const schedule = await Schedule.findOne({ professionalId: doctorId });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    console.log('Retrieved schedule:', schedule); // Log the retrieved schedule

    // Simplify the response: Filter available and bookable slots
    const simplifiedResponse = schedule.slots.filter(slot => slot.isAvailable && slot.isBookable).map(slot => ({
      _id: slot._id, // Ensure _id is included
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable,
      isBookable: slot.isBookable,
      recurrence: slot.recurrence,
    }));

    // Send the simplified response
    res.status(200).json(simplifiedResponse);
  } catch (error) {
    console.error('Error retrieving schedules:', error); // Log the error
    res.status(500).json({ message: 'Error retrieving schedules', error });
  }
};
