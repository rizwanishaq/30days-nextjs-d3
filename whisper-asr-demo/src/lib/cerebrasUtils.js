import Cerebras from '@cerebras/cerebras_cloud_sdk';


const client = new Cerebras({
    apiKey: process.env.CEREBRAS_API_KEY,
  });  


export default client;