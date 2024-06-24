const io = require("socket.io")(5800, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"],
    }
});

let users = [];

const addUser = (userId, socketId) => {
    if (!users.some((user) => user.userId === userId)) {
        users.push({ userId, socketId });
    }
};

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
    console.log("A user is connected");

    // Handle adding user
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
       
    });

    // Handle sending message
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        if (user) {
            io.to(user.socketId).emit("getMessage", {
                senderId,
                text
            });
            // Emit acknowledgment to sender
            io.to(socket.id).emit("messageSent", {
                receiverId,
                text
            });
        } else {
            console.log(`User with ID ${receiverId} not found`);
        }
    });
    

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("A user is disconnected");
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
});
