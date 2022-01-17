// 按钮事件绑定
document.querySelector('button').addEventListener('click', serialPort)
document.querySelector('button#write').addEventListener('click', buttonWrite)

/** @type {} */
let port;
let textDecoder = new TextDecoder();

async function serialPort () {
    port = await navigator.serial.requestPort();
    console.log(await port.getInfo());

    // 打开串口进行通信
    await port.open({ baudRate: 9600 });
    await waitForArduino();

    // 监视输入流
    monitorReadPort();

    // 调到最大亮度
    writePortByte(255);
}

async function buttonWrite () {
    let brightness = document.querySelector('input#brightness').value;
    console.log('write brightness: ' + brightness);
    await writePortByte(brightness);
}

/**
 * 等待Arduino进行Reset之后发送信号
 */
async function waitForArduino () {
    const reader = port.readable.getReader();
    await reader.read();
    await reader.releaseLock();
}

async function writePortByte (byte) {
    // 写入流
    const writer = port.writable.getWriter();
    let byteBuffer = new ArrayBuffer(1);
    let int8View = new Uint8Array(byteBuffer);
    int8View[0] = byte;
    await writer.write(byteBuffer);
    await writer.releaseLock();
}

async function monitorReadPort () {
    // 读取流
    while (port.readable) {
        const reader = port.readable.getReader();
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    // |reader| has been canceled.
                    break;
                }
                // Do something with |value|...
                console.log(value);
                console.log(textDecoder.decode(value));
            }
        } catch (error) {
            // Handle |error|...
        } finally {
            reader.releaseLock();
        }
    }
}

