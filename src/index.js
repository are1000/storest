class Storest {
	constructor(baseObject) {
		this._data = baseObject ? Object.assign({}, baseObject) : {}
	}

	async create(key, value) {
		this._data[key] = value
		return value
	}

	async get(key) {
		if (this._data.hasOwnProperty(key)) {
			return this._data[key]
		}

		throw new Error('Key not found')
	}

	async has(key) {
		if (this._data.hasOwnProperty(key)) {
			return true
		}

		return false
	}

	async createIfEmpty(key, value) {
		if (!this._data.hasOwnProperty(key)) {
			this._data[key] = value
			return true
		}

		return false
	}

	async subset(fn) {
		let baseObj = Object.keys(this._data).filter(fn).reduce((p, c) => {
			p[c] = this._data[c]
			return p
		}, {})

		return new Storest(baseObj)
	}

	async map(fn) {
		let baseObj = Object.entries(this._data).map(([key, value]) => fn(key, value)).reduce((p, c) => {
			Object.assign(p, c)
			return p
		}, {})

		return new Storest(baseObj)
	}

	async remove(keyOrFn) {
		if (typeof keyOrFn === 'string') {
			if (this._data.hasOwnProperty(keyOrFn)) {
				let temp = this._data[keyOrFn]
				delete this._data[keyOrFn]
				return temp
			}
	
			throw new Error('Key not found')
		} else if (typeof keyOrFn === 'function') {
			return Object.keys(this._data).filter(keyOrFn).map(key => {
				let temp = this._data[key]
				delete this._data[key]
				return { [key]: temp }
			}).reduce((p, c) => {
				Object.assign(p, c)
				return p
			}, {})
		}

		throw new Error('Wrong key')		
	}
}

module.exports = Storest