const { Contact } = require('../dbModels/contactModel')

const listContacts = async (req, res) => {
  const { _id } = req.user
  const contacts = await Contact.find({ userId: _id })
  await res.status(200).json(contacts)
}

async function getContactById(req, res) {
  const { _id } = req.user
  const contactId = req.params.contactId
  const contact = await Contact.findOne({ _id: contactId, userId: _id })
  await res.status(200).json(contact)
}

async function addContact(req, res) {
  const { _id } = req.user
  const contact = new Contact({ ...req.body, userId: _id })
  await contact.save()
  await res.status(201).json(contact)
}

async function removeContact(req, res) {
  const { _id } = req.user
  const contactToRemove = await Contact.findOneAndDelete({
    _id: req.params.contactId,
    userId: _id,
  })
  if (!contactToRemove) {
    await res.status(400).json({ message: "User don't have this contact" })
    return
  }
  await res.status(200).json({ message: 'contact deleted' })
}
const updateContact = async (req, res) => {
  const { _id } = req.user
  let updatedContact = await Contact.findOneAndUpdate(
    { _id: req.params.contactId, userId: _id },
    {
      $set: { ...req.body, userId: _id },
    },
  )
  if (!updatedContact) {
    await res.status(400).json({ message: 'Contact not found' })
    return
  }
  updatedContact = await getContactById(req, res)

  await res.status(200).json(updatedContact)
}
const updateStatusContact = async (req, res) => {
  const { _id } = req.user

  let updatedContact = await Contact.findOneAndUpdate(
    { _id: req.params.contactId, userId: _id },
    {
      $set: req.body,
    },
  )
  if (!updatedContact) {
    await res.status(400).json({ message: 'Contact not found' })
    return
  }
  updatedContact = await getContactById(req, res)

  await res.status(200).json(updatedContact)
}
module.exports = {
  listContacts,
  addContact,
  getContactById,
  removeContact,
  updateContact,
  updateStatusContact,
}
