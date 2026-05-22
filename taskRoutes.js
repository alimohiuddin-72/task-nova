// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const {
  getTasks, createTask, getTask, updateTask,
  completeTask, deleteTask, addNote, reorderTasks, getStudySuggestions,
} = require('../controllers/TaskController');
const { protect } = require('../middleware/auth');

router.use(protect); // all task routes require auth

router.get('/suggestions', getStudySuggestions);
router.patch('/reorder',   reorderTasks);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .patch(updateTask)
  .delete(deleteTask);

router.patch('/:id/complete', completeTask);
router.post('/:id/notes',     addNote);

module.exports = router;
