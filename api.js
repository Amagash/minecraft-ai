// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fileURLToPath } from "url";

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } from "@aws-sdk/client-bedrock-agent-runtime"; // ES Modules import
    

const STOP_WORD = "//";
const EOL = "\n";
/**
 * @typedef {Object} ResponseBody
 * @property {string} completion
 */

/**
 * Invokes the Anthropic Claude 2 model to run an inference using the input
 * provided in the request body.
 *
 * @param {string} prompt - The prompt that you want Claude to complete.
 * @returns {string} The inference response (completion) from the model.
 */
export const invokeClaude = async (prompt, context) => {
    const client = new BedrockRuntimeClient({ region: 'us-east-1' });

    const modelId = 'anthropic.claude-v2';

    /* Claude requires you to enclose the prompt as follows: */
    const enclosedPrompt = `Human: ${context}${EOL}${STOP_WORD}${prompt}\n\nAssistant:`;
    console.log("payload %o", enclosedPrompt);
    /* The different model providers have individual request and response formats.
     * For the format, ranges, and default values for Anthropic Claude, refer to:
     * https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-claude.html
     */
    const payload = {
        prompt: enclosedPrompt,
        max_tokens_to_sample: 500,
        temperature: 0.5,
        stop_sequences: ['\n\nHuman:'],
    };

    console.log("payload %o", payload);

    const command = new InvokeModelCommand({
        body: JSON.stringify(payload),
        contentType: 'application/json',
        accept: 'application/json',
        modelId,
    });

    try {
        const response = await client.send(command);
        const decodedResponseBody = new TextDecoder().decode(response.body);

        /** @type {ResponseBody} */
        const responseBody = JSON.parse(decodedResponseBody);

        return responseBody.completion;

    } catch (err) {
        console.error(err);
    }
};

// Invoke the function if this file was run directly.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const prompt = 'Complete the following: "Once upon a time..."';
    console.log('\nModel: Anthropic Claude v2');
    console.log(`Prompt: ${prompt}`);

    const completion = await invokeClaude(prompt);
    console.log('Completion:');
    console.log(completion);
    console.log('\n');
}


// export const callRag = async (prompt) => {
//     // const { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } = require("@aws-sdk/client-bedrock-agent-runtime"); // CommonJS import
//     const client = new BedrockAgentRuntimeClient({ region: 'us-east-1' });

//     const enclosedPrompt = `Human: ${prompt}\n\nAssistant:`;

//     const input = { // RetrieveAndGenerateRequest
//         input: { // RetrieveAndGenerateInput
//             text: enclosedPrompt, // required
//         },
//         retrieveAndGenerateConfiguration: { // RetrieveAndGenerateConfiguration
//             type: "KNOWLEDGE_BASE", // required
//             knowledgeBaseConfiguration: { // KnowledgeBaseRetrieveAndGenerateConfiguration
//                 knowledgeBaseId: "HOJS5MA1XL", // required
//                 modelArn: "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-v2:1", // required
//             },
//         },
//     };
//     const command = new RetrieveAndGenerateCommand(input);
//     const response = await client.send(command);
// }