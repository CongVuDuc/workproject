import amqp from 'amqplib';

const hostname = process.env.hostname || 'localhost';
const port = process.env.port || 5672;
const exchangename = 'order_topic';
const exchangetype = 'topic';

function createConnection(maxRetries = 12, retryInterval = 5) {
    console.log('amqp_setup:create_connection');
    
    let retries = 0;
    let connection = null;
    
    return new Promise((resolve, reject) => {
        const attemptConnection = () => {
            console.log('amqp_setup: Trying connection');
            amqp.connect(`amqp://${hostname}:${port}`, (error, conn) => {
                if (error) {
                    console.log(`amqp_setup: Failed to connect: ${error.message}`);
                    retries++;
                    console.log(`amqp_setup: Retrying in ${retryInterval} seconds...`);
                    if (retries >= maxRetries) {
                        reject(new Error("amqp_setup: Unable to establish a connection to RabbitMQ after multiple attempts."));
                    } else {
                        setTimeout(attemptConnection, retryInterval * 1000);
                    }
                } else {
                    console.log("amqp_setup: Connection established successfully");
                    resolve(conn);
                }
            });
        };
        
        attemptConnection();
    });
}

function createChannel(connection) {
    console.log('amqp_setup:create_channel');
    return new Promise((resolve, reject) => {
        connection.createChannel((error, channel) => {
            if (error) {
                reject(error);
            } else {
                console.log('amqp_setup:create exchange');
                channel.assertExchange(exchangename, exchangetype, { durable: true }, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(channel);
                    }
                });
            }
        });
    });
}

function createQueues(channel) {
    console.log('amqp_setup:create queues');
    Promise.all([createActivityLogQueue(channel), createErrorQueue(channel)])
        .then(() => console.log('amqp_setup: Queues created successfully'))
        .catch(error => console.error('amqp_setup: Error creating queues:', error.message));
}

function createActivityLogQueue(channel) {
    console.log('amqp_setup:create_activity_log_queue');
    const a_queue_name = 'Activity_Log';
    return new Promise((resolve, reject) => {
        channel.assertQueue(a_queue_name, { durable: true }, (error) => {
            if (error) {
                reject(error);
            } else {
                channel.bindQueue(a_queue_name, exchangename, '#', null, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            }
        });
    });
}

function createErrorQueue(channel) {
    console.log('amqp_setup:create_error_queue');
    const e_queue_name = 'Error';
    return new Promise((resolve, reject) => {
        channel.assertQueue(e_queue_name, { durable: true }, (error) => {
            if (error) {
                reject(error);
            } else {
                channel.bindQueue(e_queue_name, exchangename, '*.error', null, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            }
        });
    });
}

async function main() {
    try {
        const connection = await createConnection();
        const channel = await createChannel(connection);
        createQueues(channel);
    } catch (error) {
        console.error('amqp_setup: Error:', error.message);
    }
}

main();
