const { User } = require('../dbModels/userModel')
const bcrypt = require('bcrypt')
require('dotenv').config()

const gravatar = require('gravatar')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// const nodemailer = require('nodemailer')

const registration = async (password, email, subscription) => {
  const avatarURL = gravatar.url(email)
  const verificationtoken = uuidv4()

  const user = new User({
    password: await bcrypt.hash(password, 10),
    email,
    subscription,
    avatarURL,
    verificationtoken,
  })

  await user.save()
  const msg = {
    to: email,
    from: 'peacefilip1989@gmail.com',
    subject: 'Verify your email  ✔',
    text: `Please confirm your email adress https://connnections.herokuapp.com/api/users/verify/${verificationtoken}`,
    html: `<a href="
https://connnections.herokuapp.com/api/users/verify/${verificationtoken}">Please confirm your email adress</a>`,
  }
  return sgMail
    .send(msg)
    .then(() => {
      return 'user added. Please verify by email'
    })
    .catch(error => {
      return error.message
    })
}
const login = async (email, password) => {
  let user = await User.findOne({
    email,
  })
  const rightPassword = await bcrypt.compare(password, user.password)
  if (rightPassword) {
    const createdAt = new Date()
    const token = jwt.sign(
      { _id: user._id, createdAt },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    )
    user.token = token
    if (!user.verify) {
      return { verify: user.verify }
    }
    user = await User.findOneAndUpdate(
      { email },
      {
        $set: user,
      },
    )
    user = await User.findOne({
      email,
    })
    return user
  }
  return rightPassword
}
const logout = async token => {
  let user = await User.findOneAndUpdate(
    { token },
    {
      $set: { token: null },
    },
  )
  user = await User.findById(user._id)
  return user.token
}
const changeAvatar = async (avatarURL, token) => {
  const user = await User.findOneAndUpdate(
    { token },
    {
      $set: { avatarURL },
    },
  )
  return user.email
}

const verificationService = async req => {
  const user = await User.findOneAndUpdate(
    { verificationtoken: req.params.verificationtoken },
    {
      $set: { verify: true, verificationtoken: null },
    },
  )
  return user
}
const verificationCheckService = async email => {
  const user = await User.findOne({ email })
  if (user.verify) {
    return true
  } else {
    const msg = {
      to: email,
      from: 'peacefilip1989@gmail.com',
      subject: 'Verify your email  ✔',
      text: `Please confirm your email adress https://connnections.herokuapp.com/api/users/verify/${user.verificationtoken}`,
      html: `<a href="
https://connnections.herokuapp.com/api/users/verify/${user.verificationtoken}">Please confirm your email adress</a>`,
    }
    const sendVerification = sgMail
      .send(msg)
      .then(() => {
        return user.verify
      })
      .catch(error => {
        return error.message
      })
    return sendVerification
  }
}
module.exports = {
  registration,
  login,
  logout,
  changeAvatar,
  verificationService,
  verificationCheckService,
}
