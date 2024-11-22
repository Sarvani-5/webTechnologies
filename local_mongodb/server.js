const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = 5000;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/eventsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

mongoose.set('debug', true); // Enable Mongoose debugging

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Handle JSON request bodies

// Define Event schema and model
const eventSchema = new mongoose.Schema({
    name: String,
    date: Date,
    location: String,
    coordinator: String, // Added coordinator field
    email: { type: String, required: true }, // Added email field
    description: String
});

// Specify 'event' as the collection name
const Event = mongoose.model('Event', eventSchema, 'event');

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST route to add a new event
app.post('/add-event', async (req, res) => {
    const { name, date, location, coordinator, email, description } = req.body;

    try {
        const newEvent = new Event({
            name,
            date: new Date(date), // Ensure date is parsed correctly
            location,
            coordinator,
            email,
            description
        });

        await newEvent.save();
        console.log('Event added successfully:', newEvent); // Log event details when added successfully

        res.status(201).json({ message: 'Event added successfully!' });
    } catch (error) {
        console.error('Error adding event:', error);
        res.status(500).json({ message: 'Failed to add event' });
    }
});

// GET route to fetch all events
app.get('/get-events', async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Failed to fetch events' });
    }
});

// DELETE route to remove an event by id
app.delete('/delete-event/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedEvent = await Event.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        console.log('Document deleted:', deletedEvent); // Log the deleted document

        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
