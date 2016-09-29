/**
 * Created by simba on 9/29/16.
 */

globle_init = function(){
    const options = {
        endpoint: "ws://localhost:5000/websocket",
        SocketConstructor: WebSocket
    };
    const ddp = new appUtils.ddp(options);
    ddp.on("connected", () => {
        console.log("Connected");
    });
    const myLoginParams = {
        user: {
            email: "Test@163.com"
        },
        password: "123456"
    };
    const methodId = ddp.method("login", [myLoginParams]);
    ddp.on("result", message => {
        if (message.id === methodId && !message.error) {
            console.log("Logged in!");
        }
    });
};