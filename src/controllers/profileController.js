import User from '../models/User.js';

export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { firstName, surname, email, phone, gender } = req.body;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update fields that are allowed
    user.firstName = firstName || user.firstName;
    user.surname = surname || user.surname;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.gender = gender || user.gender;

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};



// Get Profile Controller
export const getProfile = async (req, res) => {
  const userId = req.user.id;  

  try {
    const user = await User.findById(userId).select('-password -pin');  // Exclude sensitive data like password and pin
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

