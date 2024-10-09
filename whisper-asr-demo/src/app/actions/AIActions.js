'use server'
import client from "@/lib/cerebrasUtils";



export async function get_completion(text) {
    const completionCreateResponse = await client.chat.completions.create({
        messages: [{ role: 'user', content: text }],
        model: 'llama3.1-70b',
      });
    
      console.log(completionCreateResponse.choices[0].message.content);
      const response = {"text": completionCreateResponse.choices[0].message.content}
      return response
}
    


