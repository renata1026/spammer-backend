import { PrismaClient } from '@prisma/client';
import express from 'express';
import cors from 'cors';
import { log } from 'console';
import e from 'express';
import console from 'console';

const prisma = new PrismaClient();
const app = express();
app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.send({ success: true, message: 'Welcome to the Spammer Server' });
});

app.get('/messages', async (req, res) => {
  // get the actual users from the db
  console.log('messages get');

  const messages = await prisma.message.findMany({
    include: { children: true },
  });
  res.send({ success: true, messages });
});

app.post('/messages', async (req, res) => {
  const { text, parentId } = req.body;

  console.log(req.body);

  //checks if text is provided in request body, if not it returns an error response
  if (!text) {
    return res.send({
      success: false,
      error: 'Text must be provided to create a message!',
    });
  }
  let id = null;
  try {
    let message;
    if (parentId) {
      message = await prisma.child.create({
        data: {
          text,
        },
      });

      id = message.id;

      // find a parent, and add a child to it childs array
      const parent = await prisma.message.findFirst({
        where: {
          id: parentId,
        },
        include: {
          children: true,
        },
      });

      if (!parent) {
        return res.send({
          success: false,
          error: 'Parent message not found!',
        });
      } else {
        const updatedParent = await prisma.message.update({
          where: {
            id: parentId,
          },
          data: {
            children: [...parent.children, message],
          },
        });
        console.log(updatedParent);
        res.send({ success: true, message: updatedParent, id: id });
      }
    } else {
      message = await prisma.message.create({
        data: {
          text,
        },
      });

      res.send({ success: true, message: 'message created' });
    }
  } catch (error) {
    console.log(error);
    res.send({ success: false, error: error.message, id: id });
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

app.post('/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params; //
    const { parentId } = req.body;
    console.log(messageId, parentId);

    if (parentId) {
      // make the child isDelete true
      const message = await prisma.child.update({
        where: {
          id: messageId,
        },
        data: {
          isDeleted: true,
        },
      });

      console.log(message);

      res.send({ success: true, message });
    } else {
      console.log('delete parent', messageId);
      await prisma.child.deleteMany({
        where: {
          parentId: messageId,
        },
      });
      // make childerns froiegn array empty first

      const message = await prisma.message.delete({
        where: {
          id: messageId,
        },
      });
      res.send({ success: true, message: 'message deleted' });
    }
  } catch (error) {
    res.send({ success: false, error: error.message });
    console.log(error);
  }
});

//middleware functions
app.use((req, res) => {
  res.send({ success: false, error: 'Route not found!' });
});

app.use((error, req, res, next) => {
  res.send({ success: false, error: error.message });
});

const port = 3001;

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
