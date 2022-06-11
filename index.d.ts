declare module 'mongoose-nanoid'

import { Schema } from 'mongoose'

type MongooseNanoidOptions = {
	length?: number
	alphabet?: string
}

export default function nanoidPlugin(
	schema: Schema,
	opts: MongooseNanoidOptions
): void
