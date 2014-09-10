App = Ember.Application.create();

App.Router.map(function() {
  // put your routes here
  this.resource('book', { path: '/books/:book_id'});
  this.resource('genre', { path: '/genres/:genre_id'});
  this.resource('reviews', function(){
  	this.route('new');
  });
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return Ember.RSVP.hash({
    	books: this.store.findAll('book'),
    	genres: this.store.findAll('genre')
    });
  },
  setupController: function(controller, model) {
  	controller.set('books', model.books);
  	controller.set('genres', model.genres);
  }
});

// App.BookRoute = Ember.Route.extend({
// 	model: function(params){
// 		return this.store.find('book', params.book_id);
// 	}
// })

App.IndexController = Ember.Controller.extend({
});

App.BooksController = Ember.ArrayController.extend({
	sortProperties: ['title']
});

App.GenresController = Ember.ArrayController.extend({
	sortProperties: ['name']
});

App.ReviewsNewRoute = Ember.Route.extend({
	model: function() {
	  return Ember.RSVP.hash({
	  	book: this.store.createRecord('book'),
	  	genres: this.store.findAll('genre')
	  });
	},
	setupController: function(controller, model) {
		controller.set('model', model.book);
		controller.set('genres', model.genres);
	},
	actions: {
		willTransition: function(transition) {
			if(this.currentModel.book.get('isNew')) {
				if(confirm('Are you sure you want to abandon your progress?')) {
					this.currentModel.book.destroyRecord();
				} else {
					transition.abort();
				}
			}
		}
	}
});

App.ReviewsNewController = Ember.Controller.extend({
	ratings: [5,4,3,2,1],
	actions: {
		createReview: function(){
			var controller = this;
			this.get('model').save().then(function(model){
				var genre = model.get('genre');
				genre.get('books').then(function(books){
					books.pushObject(model);
					genre.save();
					controller.transitionToRoute('index');
				});
			});
		}
	}
});

App.ApplicationAdapter = DS.FirebaseAdapter.extend({
	firebase: new Firebase('https://mateo-readinglist.firebaseIO.com')
});

App.BookDetailsComponent = Ember.Component.extend({
	classNameBindings: ['ratingClass'],
	ratingClass: function(){
		return 'rating-' + this.get('book.rating')
	}.property('book.rating')
});

App.Book = DS.Model.extend({
	title: DS.attr(),
	author: DS.attr(),
	review: DS.attr(),
	rating: DS.attr('number'),
	amazon_id: DS.attr(),
	genre: DS.belongsTo('genre'),
	url: function(){
		return 'http://amazon.com/gp/product/'+this.get('amazon_id')+'adamfortuna-20';
	}.property('amazon_id'),
	image: function(){
		return 'http://images.amazon.com/images/P/'+this.get('amazon_id')+'.01.ZTZZZZZZ.jpg'
	}.property('amazon_id'),
});

App.Book.FIXTURES = [
  {
  	id: 1,
  	title: 'Mindstorms',
  	author: 'Seymour A. Papert',
  	review: "This is the best book I have ever read on how to assist people to learn for themselves. Papert began his work by collaborating with Jean Piaget, and then applied those perspectives in a self-programming language designed to help children learn math and physics. Papert explains Piaget's work and provides case studies of how the programming language, LOGO, can help. He provides a wonderful contrasting explanation of the weaknesses of how math and physics are usually taught in schools.",
		rating: 5,
		amazon_id: '0465046746',
		genre: 3
  },
  {
  	id: 2,
  	title: 'Hyperion',
  	author: 'Dan Simmons',
  	review: "Though 'Hyperion' is dependent upon its sequel and ends with a tooth-grinding cliff-hanger, it is in its way self-contained. 'Hyperion' is centered on the six pilgrims' tales, their pasts, the terrible needs which drive them to confront what is almost certain death--or worse. Each of the tales is written in a unique style, and each introduces a new element to bind the story as a whole. All are wrenching, even disturbing in their intensity, in their focus on the deepest possible of human suffering.",
		rating: 5,
		amazon_id: '0553283685',
		genre: 1
  },
  {
  	id: 3,
  	title: "Jony Ive: The Genius Behind Apple's Greatest Products",
  	author: 'Leander Kahney',
  	review: "I consider myself a casual Apple historian, in that I am a big fan of Apple’s work and through that interest I have learned a fair amount about their past. It is with much interest that I purchased Leander Khaney’s Jony Ive, a biography of Apple’s famed lead designer. A month ago, I linked to an excerpt about the beginnings of the first iPhone. It is quite good and had me excited to read the rest of the book. Unfortunately (but not unexpectedly) this was the best portion of the book by far.",
		rating: 2,
		amazon_id: '159184617X',
		genre: 3
  }
];

App.Genre = DS.Model.extend({
	name: DS.attr(),
	books: DS.hasMany('book', {async: true})
});

App.Genre.FIXTURES = [
	{
		id: 1,
		name: 'Sci Fi',
		books: [2]
	},
	{
		id: 2,
		name: 'Fiction'
	},
	{
		id: 3,
		name: 'Non-Fiction',
		books: [1,3]
	}
]
