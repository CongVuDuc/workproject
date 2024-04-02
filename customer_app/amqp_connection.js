import amqp from 'amqplib';

const { hostname: rabbitHost, port: rabbitPort } = process.env;

const hostname = rabbitHost || 'localhost';
const port = rabbitPort || 5672;

export async function createConnection(maxRetries = 12, retryInterval = 5) {
    console.log('amqp_connection: Create_connection');
    
    let retries = 0;
    let connection = null;
    
    while (retries < maxRetries) {
        try {
            console.log('amqp_connection: Trying connection');
            // connect to the broker
            connection = await amqp.connect(`amqp://${hostname}:${port}`);
            console.log("amqp_connection: Connection established successfully");
            break;  // Connection successful, exit the loop
        } catch (error) {
            console.log(`amqp_connection: Failed to connect: ${error.message}`);
            retries++;
            console.log(`amqp_connection: Retrying in ${retryInterval} seconds...`);
            await new Promise(resolve => setTimeout(resolve, retryInterval * 1000));
        }
    }
    
    if (!connection) {
        throw new Error("Unable to establish a connection to RabbitMQ after multiple attempts");
    }
    
    return connection;
}

export async function checkExchange(channel, exchangeName, exchangeType) {
    try {
        await channel.assertExchange(exchangeName, exchangeType, { durable: true });
        return true;
    } catch (error) {
        console.log('Exception:', error.message);
        return false;
    }
}
