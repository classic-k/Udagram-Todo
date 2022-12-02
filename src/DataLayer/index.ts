import 'source-map-support/register'
import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

const urlExpiration = process.env.URL_EXPIRATION

import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

const logger = createLogger('createTodo')

export class Todo {

    constructor(
        private readonly docClient: DocumentClient = dynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,

    ) {
    }

    async getTodos(userId: string): Promise<TodoItem[]> {
        //const todoIndex = process.env.INDEX_NAME

        const todos = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()


        logger.info("Fetched todos from Dynamo DB ")

        const items = todos.Items
        return items as TodoItem[]
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()

        return todoItem
    }

    async updateTodo(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
        var params = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: "set #n = :r, dueDate=:p, done=:a",
            ExpressionAttributeValues: {
                ":r": todoUpdate.name,
                ":p": todoUpdate.dueDate,
                ":a": todoUpdate.done
            },
            ExpressionAttributeNames: {
                "#n": "name"
            },
            ReturnValues: "UPDATED_NEW"
        };

       await this.docClient.update(params).promise()
        logger.info(`Todo with ID: ${todoId} update successful`)
        return todoUpdate

    }



    async deleteTodo(userId: string, todoId: string): Promise<Boolean> {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }).promise()
        
        logger.info(`Todo with ID: ${todoId} delete successfull`)

        return true

    }

    async saveAttURL(userId: string, todoId: string): Promise<String> {
       

        const att_url: string = 'https://' + this.bucketName + '.s3.amazonaws.com/' + todoId
        const bucketName = process.env.ATTACHMENT_S3_BUCKET
        const url = this.getUploadUrl(todoId, bucketName)
        const options = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: "set attachmentUrl = :r",
            ExpressionAttributeValues: {
                ":r": att_url
            },
            ReturnValues: "UPDATED_NEW"
        };

        await this.docClient.update(options).promise()
      
        logger.info("Attachment URL updated successful ", att_url)
        logger.info("Attachment Presigned URL generated", url)
       return url
    }
    
    getUploadUrl(todoId: string, bucketName: string): string {
        const url = s3.getSignedUrl('putObject', {
            Bucket: bucketName,
            Key: todoId,
            Expires: parseInt(urlExpiration)
        })

        return  url
    } 
}





const dynamoDBClient = () => {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB instance')
     
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}