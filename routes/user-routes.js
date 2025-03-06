const router= require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({
            email
        });
        if (user) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        const newUser = new User({
            email,
            password
        });

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);
        await newUser.save();
        res.status(200).json({
            message: 'User registered successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}
);

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({
            email
        });
        if (!user) {
            return res.status(400).json({
                message: 'User does not exist'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: 3600
        }, (err, token) => {
            if (err) throw err;
            res.status(200).json({
                id: user.id,
                token:token
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}
);

router.post("/signout", (req, res) => {
    try {
        console.log("Request Headers:", req.headers);
        const token = req.headers.authorization;
        const {id}=req.headers;
        console.log(token,id)
        if (!id) {
            return res.status(401).json({ message: "No user id provided" });
        }

        if (!token) {
          return res.status(401).json({ message: "No token provided" });
        }

        res.clearCookie("token");
        return res
          .status(200)
          .json({ message: "User signed out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;