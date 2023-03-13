import { TodoItem }  from '../models/TodoItem';
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
const uuid = require('uuid/v4')
import * as AWS from 'aws-sdk'
const XAWS =  require('aws-sdk');

export class TodosAccess {
    constructor(
        // private readonly XAWS = AWSXRay.captureAWS(AWS),
        private readonly docClient: AWS.DynamoDB.DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODO_TABLE,
        private readonly userIdIndex = process.env.USER_ID_INDEX
    ) { }

    async getUserTodos(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        return result.Items as TodoItem[]
    }


    async createTodo(request: CreateTodoRequest, userId: string): Promise<TodoItem> {
        const newId = uuid()
        const item : TodoItem = {
        userId : userId,
        todoId : newId,
        createdAt : new Date().toISOString(),
        name : request.name,
        dueDate : request.dueDate,
        done : false
        }

        await this.docClient.put({
            TableName: this.todosTable,
            Item: item
        }).promise()

        return item
    }


    async getTodoById(id: string,userId: string): Promise<AWS.DynamoDB.QueryOutput> {
        return await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'todoId = :todoId AND userId = :userId',
            ExpressionAttributeValues: {
                ':todoId': id,
                ':userId': userId
            }
        }).promise()
    }

    async updateTodo(updatedTodo: UpdateTodoRequest, todoId: string,userId: string) {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                'todoId': todoId,
                'userId' : userId
            },
            UpdateExpression: 'set #namefield = :n, dueDate = :d, done = :done',
            ExpressionAttributeValues: {
                ':n': updatedTodo.name,
                ':d': updatedTodo.dueDate,
                ':done': updatedTodo.done
            },
            ExpressionAttributeNames: {
                "#namefield": "name"
            }
        }).promise()
    }

    async deleteTodoById(todoId: string, userId: string) {
        const param = {
            TableName: this.todosTable,
            Key: {
                "todoId": todoId,
                "userId": userId
            }
        }

        await this.docClient.delete(param).promise()
    }
}