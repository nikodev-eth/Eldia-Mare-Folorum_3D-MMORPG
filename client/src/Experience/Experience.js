import * as THREE from 'three'
import EventEmitter from './Utils/EventEmitter'

import Debug from './Utils/Debug.js'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Resources from './Utils/Resources.js'

import sources from './sources.js'

import FrameCount from './Utils/FrameCount.js'

let instance = null

export default class Experience extends EventEmitter {
	constructor(_canvas) {
		super()
		// Singleton
		if (instance) {
			return instance
		}
		instance = this

		// Global access
		window.experience = this

		// Options
		this.canvas = _canvas

		// Setup
		this.debug = new Debug()
		// this.frameCount = new FrameCount()
		this.sizes = new Sizes()
		this.time = new Time()
		this.scene = new THREE.Scene()
		this.resources = new Resources(sources)
		this.camera = new Camera()
		this.renderer = new Renderer()
		this.world = new World()

		// Resize event
		this.sizes.on('resize', () => {
			this.resize()
		})

		// Time tick event
		this.time.on('tick', () => {
			/// access start frame ticker before each frame update
			// this.frameCount.stats.begin()
			this.update()
			/// stop the frame counter after each frame
			// this.frameCount.stats.end()
		})

		// raycaster set up
	}

	resize() {
		this.camera.resize()
		this.renderer.resize()
		this.world.resize()
	}

	update() {
		this.camera.update()
		this.world.update()
		this.renderer.update()
	}

	testEventEmitter(mushroom) {
		console.log('test event emitter')
		this.trigger(mushroom)
	}

	destroy() {
		this.sizes.off('resize')
		this.time.off('tick')

		// Traverse the whole scene
		this.scene.traverse((child) => {
			// Test if it's a mesh
			if (child instanceof THREE.Mesh) {
				child.geometry.dispose()

				// Loop through the material properties
				for (const key in child.material) {
					const value = child.material[key]

					// Test if there is a dispose function
					if (value && typeof value.dispose === 'function') {
						value.dispose()
					}
				}
			}
		})

		this.camera.controls.dispose()
		this.renderer.instance.dispose()

		if (this.debug.active) this.debug.ui.destroy()
	}
}
