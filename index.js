import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send({ success: true, message: 'Welcome to the Spammer Server' });
});

app.get('/messages', async (req, res) => {
  // get the actual users from the db
  const messages = await prisma.message.findMany({
    include: { children: true },
  });
  res.send({ success: true, messages });
});

app.post('/messages', async (req, res) => {
  const { text, parentId } = req.body;

  //checks if text is provided in request body, if not it returns an error response
  if (!text) {
    return res.send({
      success: false,
      error: 'Text must be provided to create a message!',
    });
  }
  try {
    let message;
    if (parentId) {
      //check if parent message exists
      const parentMessage = await prisma.message.findUnique({
        where: {
          id: parentId,
        },
      });

      //Adds children to a parent message,
      message = await prisma.child.create({
        data: {
          text,
          parentId,
        },
      });
    } else {
      message = await prisma.message.create({
        data: {
          text,
        },
      });
    }

    res.send({ success: true, message });
  } catch (error) {
    res.send({ success: false, error: error.message });
  }
});

app.put('/messages/:messageId', async (req, res) => {
  const { messageId } = req.params; //
  const { text, likes } = req.body;

  //Check if text and likes are missing
  if (!text && !likes) {
    return res.send({
      success: false,
      error: 'Text or likes must be provided to create a message!',
    });
  }
  //Check if likes is a number
  if (isNaN(Number(likes))) {
    return res.send({
      success: false,
      error: 'Likes must be a number!',
    });
  }

  //search for the message with an id if it doesn't exist can't update it because it doesn't exist
  const messageSearch = await prisma.message.findFirst({
    where: {
      id: messageId,
    },
  });
  if (!messageSearch) {
    return res.send({
      success: false,
      error: 'Message not found!',
    });
  }

  try {
    const updatedMessage = await prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        text,
        likes,
      },
    });

    return res.send({ success: true, message: updatedMessage });
  } catch (error) {
    // Handle any other potential errors here
    return res.send({
      success: false,
      error: error.message,
    });
  }
});

app.delete('/messages/:messageId', async (req, res) => {
  const { messageId } = req.params; //
  const message = await prisma.message.delete({
    where: {
      id: messageId,
    },
  });
  res.send({ success: true, message });
});

//middleware functions
app.use((req, res) => {
  res.send({ success: false, error: 'Route not found!' });
});

app.use((error, req, res, next) => {
  res.send({ success: false, error: error.message });
});

const port = 3000;

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
