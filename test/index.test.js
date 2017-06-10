const Storest = require('../src/index.js')
const assert = require('assert')

describe('Storest', it => {
	it('.constructor should merge argument object into the store', async () => {
		let obj = {
			key: 'testValue'
		}

		let store = new Storest(obj)

		let result = await store.get('key')

		assert.strictEqual(result, 'testValue')
	})

	it('#create should create new entry and override one if it already exists', async () => {
		let store = new Storest()

		let result = await store.create('key', 'testValue')

		assert.strictEqual(store._data['key'], 'testValue')
	})

	it('#createIfEmpty should create new entry only if it doesn\'t already exist', async () => {
		let store = new Storest()

		let result = await store.create('key1', 'testValue1')
		let result2 = await store.createIfEmpty('key1', 'testValue2')
		let result3 = await store.createIfEmpty('key2', 'testValue3')

		assert.strictEqual(store._data['key1'], 'testValue1', 'set when not empty')
		assert.strictEqual(store._data['key2'], 'testValue3', 'set when empty')
	})

	it('#get should return correct value', async () => {
		let store = new Storest()

		await store.create('key', 'testValue')

		let result = await store.get('key')

		assert.strictEqual(result, 'testValue')
	})

	it('#get should fail if key doesn\'t exist', async () => {
		let store = new Storest()

		try {
			await store.get('key')
			assert.fail('did not throw', 'to throw', 'should throw', '')
		} catch (e) {
			if (e.name === 'AssertionError') throw e
		}
	})

	it('#subset should return new store where keys pass the test', async () => {
		let store = new Storest()

		await store.create('key1', 'testValue1')
		await store.create('key2', 'testValue2')
		await store.create('wrongkey', 'testValue3')

		let results = await store.subset(key => /^key[0-9]$/.test(key))

		assert.deepStrictEqual(results._data, { key1: 'testValue1', key2: 'testValue2' })
	})

	it('#map should create new store based on a transform function', async () => {
		let store = new Storest()

		await store.create('key1', 'testValue1')
		await store.create('key2', 'testValue2')
		await store.create('key3', 'testValue3')

		let results = await store.map((key, value) => ({ [key]: value + 'a' }))

		assert.deepStrictEqual(results._data, {
			key1: 'testValue1a',
			key2: 'testValue2a',
			key3: 'testValue3a'
		})
	})

	it('#has should check if key exists', async () => {
		let store = new Storest()

		await store.create('key1', 'testValue1')

		let r1 = await store.has('key1')
		let r2 = await store.has('key2')

		assert.strictEqual(r1, true, 'should exist')
		assert.strictEqual(r2, false, 'shouldn\'t exist')
	})

	it('#remove with string argument should remove key from store', async () => {
		let store = new Storest()

		await store.create('key1', 'testValue1')
		await store.create('key2', 'testValue2')

		let deleted = await store.remove('key1')

		assert.deepStrictEqual(store._data, {
			key2: 'testValue2'
		})
	})

	it('#remove with function argument should remove all keys that pass the test', async () => {
		let store = new Storest()

		await store.create('key1', 'testValue1')
		await store.create('key2', 'testValue2')
		await store.create('wrongkey', 'testValue3')

		let deleted = await store.remove(key => /^key[0-9]$/.test(key))

		assert.deepStrictEqual(store._data, {
			wrongkey: 'testValue3'
		})
	})

	it('should perform complex operations', async () => {
		let store = new Storest()

		await store.create('key1', 'testValue1')
		await store.create('key2', 'testValue2')
		await store.create('wrongkey', 'testValue3')

		let store2 = await store.subset(key => /^key[0-9]$/.test(key))
		let store3 = await store2.map((key, value) => ({ [key]: value + 'a' }))

		await store3.remove('key2')

		assert.deepStrictEqual(store3._data, {
			key1: 'testValue1a'
		})
	})
})