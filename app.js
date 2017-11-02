const Editor = {
	props:[
		'entityObject'
	],
	data() {
		return {
			entity: this.entityObject
		}
	},
	methods: {
		update() {
			this.$emit('update')
		}
	},
	template: `
		<div class="ui form">
			<div class="field">
				<textarea rows="5" placeholder="写点东西" v-model="entity.body" @input="update"></textarea>
			</div>
		</div>
	`
}


const Note = {
	props: [
		'entityObject'
	],
	components: {
		'editor': Editor
	},
	data() {
		return {
			entity: this.entityObject,
			open: false
		}
	},
	methods: {
		save() {
			loadCollection('notes')
				.then((collection) =>{
					collection.update(this.entity)
					db.saveDatabase()
				})
		},
		destroy() {
			this.$emit('destroy', this.entity.$loki)
		}
	},
	computed: {
		header() {
			return _.truncate(this.entity.body, {length: 30})
		},
		updated() {
			return moment(this.entity.meta.updated).fromNow()
		},
		words() {
			return this.entity.body.trim().length
		}
	},
  template: `
  <div class="item">
  	<div class="meta">
			{{updated}}
  	</div>
  	<div class="content">
  		<div class="header" @click="open = !open">
  			{{header || '新建笔记' }}
  		</div>
  		<div class="extra">
  			<editor :entity-object="entity" v-if="open" @update="save"></editor>
  			{{words}}字
  			<i class="right floated trash outline icon" v-if="open" @click="destroy"></i>
  		</div>
  	</div>
  </div>
	`
};

const Notes = {
	data() {
		return {
			entities: []
		}
	},
	created() {
		loadCollection('notes')
			.then(collection => {
				const _entities = collection.chain()
					.find()
					.simplesort('$loki1', 'isdesc')
					.data()
				this.entities = _entities;
				console.log(this.entities);
			});
	},
	methods: {
		create() {
			loadCollection('notes')
				.then((collection) => {
					const entity = collection.insert({
						body: ''
					})
					db.saveDatabase()
					this.entities.unshift(entity)
				})
		},
		destroy(id) {
			const _entities = this.entities.filter((entity) => {
				return entity.$loki !== id
			})

			this.entities = _entities;

			loadCollection('notes')
				.then((collection) => {
					collection.remove({
						'$loki': id
					})
					db.saveDatabase()
				})
		}
	},
  components: {
      'note': Note
  },
  template: `
	<div class="ui container notes">
		<h4 class="ui horizontal divider header">
			<i class="sticky note icon"></i>
			Notes APP
		</h4>
		<a class="ui right floated basic violet button" @click="create">添加笔记</a>
		<div class="ui divided items">
			<note v-for="entity in entities" :entityObject="entity" :key="entity.$loki"
			 @destroy="destroy"></note>
			<span class="ui small disabled header" v-if="!this.entities.length">还没有笔记，请先添加笔记。</span>
		</div>
	</div>
	`
};

const app = new Vue({
  el: '#app',
  components: {
      'notes': Notes
  },
  template: `
	<notes></notes>
	`
});
