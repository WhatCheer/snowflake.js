/*! 
	Made With JOY by What Cheer

	http://whatcheer.com/
*/
function SnowFlake ( options ) {
	var self = this;

	// Defaults
	this.options = {
		parent        : document.body, 
		img           : 'small.png',
		weight        : 1,
		sway          : 10,
		sway_speed    : 0.15,
		roll_delay    : 0
	};

	// These are all set on image load
	this.width = 0;
	this.height = 0;
	this.bottom_buffer = 0;
	this.max_dimension = 0;
	this.ready = false;
	this.error = false;

	// Merge arguments with default options
	for (var attrname in options) { this.options[attrname] = options[attrname]; }

	// The image DOM object
	this.img = document.createElement( 'img' );

	// Onload, grab all the data we need
	this.img.onload = function () { 
		self.width = this.width;
		self.height = this.height;
		self.max_dimension = ( self.width > self.height ) ? self.width : self.height;
		self.bottom_buffer = Math.floor( self.max_dimension / 4 );
		self.ready = true;
	};
	this.img.onerror = function () { self.error = true; }

	this.img.setAttribute( 'src', this.options.img );
	this.img.style.position = 'absolute';
	this.img.style.zIndex = 99;

	// Interval timer for redrawing
	this.timer = null;

	// Seed the starting point
	this.top = this.options.top;
	this.left = this.options.left;

	// Seed the counter so sway is not uniform
	this.ctr = Math.floor( Math.random() * this.options.sway ) + 1;

	// Accelerator counters for x and y
	this.y_accel = 0;
	this.x_accel = 0;

	// Start the snowflake
	this.start = function () {
		var self = this;

		// Wait until flake image is loaded to start
		if( ! this.ready ) {
			if( ! self.error ) { this.timer = setTimeout( function () { self.start(); }, 250 ); }
			return;
		}

		this.draw();
		this.options.parent.appendChild( this.img );
		this.timer = setInterval( function () { self.tick(); }, 100 );
		// IE fix :-|
		if( "undefined" == typeof this.img.addEventListener ) {
			this.img.attachEvent( "onmouseover", function ( e ) { return self.mouseover( e ); } );
		}
		else {
			this.img.addEventListener( "mouseover", function ( e ) { return self.mouseover( e ); } );
		}
	};

	// On mouseover, set the accelerator counters
	this.mouseover = function ( e ) {
		var left_half = this.left + ( this.img.clientWidth / 2 );

		if( e.x < left_half ) {
			this.x_accel = 10;
		}
		else {
			this.x_accel = -10;
		}
	
		this.y_accel = -10;
	};
	
	// Stop the snowflake
	this.stop = function () {
		clearInterval( this.timer );
	};

	// Change the snowflake data one step
	this.tick = function () {

		var max_potential_height = this.top
			+ this.max_dimension 
			+ this.options.weight 
			+ this.y_accel;

		// Check we aren't at the bottom (with a little give for rotation)
		if( max_potential_height > this.minHeight() - this.bottom_buffer ) {
				// Restart!
				this.top = this.options.top;
				this.left = this.options.left;
				this.y_accel = 0;
				this.x_accel = 0;
		}
		else {
			// Otherwise, move downward
			this.top += this.options.weight + this.y_accel;
			this.ctr++;
		}

		// Deceleration!
		if( this.y_accel < 0 ) { this.y_accel = this.y_accel + 1; }
		if( this.y_accel > 0 ) { this.y_accel = this.y_accel - 1; }
		if( this.x_accel > 0 ) { this.options.left += --this.x_accel; }
		if( this.x_accel < 0 ) { this.options.left += ++this.x_accel; }

		// Update x position based on a sine wave
		this.left = this.options.left + Math.sin( this.ctr * this.options.sway_speed ) * this.options.sway;

		if( this.left + this.max_dimension + 1 >= this.minWidth() ) {
			// If we would move outside the window, bring it back in
			// It's a bit harsh, but it's better than scroll bars
			this.left = this.maxWidth() - this.max_dimension - 1;
			this.options.left = this.left - this.max_dimension;
		}

		// Update the flake DOM!
		this.draw();
	};

	// Update the snowflake's position
	this.draw = function () {
		// Set left and right
		this.img.style.top = this.top + 'px';
		this.img.style.left = this.left + 'px';

		// Fade out as we descend
		var height_offset = this.maxHeight() - ( this.top + this.height + this.bottom_buffer ),
		    height_marker = Math.floor( this.maxHeight() / 4 ),
				opacity       = 1;

		opacity = ( height_offset < height_marker ) ? height_offset / height_marker : 1;

		// We only do fade out on IE >= 9
		// Older filters are impossibly slow + alpha PNG goes poorly
    this.img.filter = "alpha(opacity=" + Math.floor( opacity * 100 ) + ")";

		// Other browsers
		this.img.style.opacity = opacity;

		// Cross browser rotation
		var rotate = "rotate(" + ( this.ctr * this.options.roll_delay ) % 360 + "deg)";
		this.img.style.webkitTransform = rotate;
		this.img.style.mozTransform = rotate;
		this.img.style.msTransform = rotate;
		this.img.style.oTransform = rotate;
	};


	this.maxWidth = function () {
		return ( this.options.parent.clientWidth > this.options.parent.offsetWidth ) ? this.options.parent.offsetWidth : this.options.parent.clientWidth;
	};

	this.minWidth = function () {
		return ( this.options.parent.clientWidth < this.options.parent.offsetWidth ) ? this.options.parent.offsetWidth : this.options.parent.clientWidth;
	};

	this.maxHeight = function () {
		return ( this.options.parent.clientHeight > this.options.parent.offsetHeight ) ? this.options.parent.offsetHeight : this.options.parent.clientHeight;
	};

	this.minHeight = function () {
		return ( this.options.parent.clientHeight < this.options.parent.offsetHeight ) ? this.options.parent.offsetHeight : this.options.parent.clientHeight;
	};

};
