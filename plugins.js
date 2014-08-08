
var Plugins = {
	mandelbrot_orbit_trap: {
		title: "Mandelbrot / Orbit Trap",
		desc: "A rendering of the Mandelbrot fractal using the Orbit trap algorithm",
		iterator: function(x, y) {
			var Zx = 0.0;
		    var Zy = 0.0;

		    var xx = 0;
		    var yy = 0;

		    var mod = 0;
		    var mod2 = 0;

		    var point_dist = 100000;
		    var line_dist = 100000;

			for(var n = 0; n < MAX_ITERATIONS; n++) {
		        //Z = Z * Z + c
		        Zy = y + 2 * Zx * Zy;
		        Zx = x + xx - yy;

		        xx = Zx * Zx;
		        yy = Zy * Zy;

		        mod = xx + yy;
		        mod2 = Math.min(xx, yy);

		        if( mod < point_dist ) {
		        	point_dist = mod;
		        }

		        if( mod2 < line_dist ) {
		        	line_dist = mod2;
		        }
		    }

		    //return Math.sqrt(Math.sqrt(point_dist));
		    return Math.sqrt(Math.sqrt(line_dist));
		},
	},
	
	julia_orbit_trap: {
		title: "Julia / Orbit Trap",
		desc: "A rendering of the Julia fractal around the point (-0.98, 0.34) using the Orbit trap algorithm",
		iterator: function(x, y) {
			var Zx = x;
		    var Zy = y;

		    var cx = -0.98;
		    var cy = 0.34;

		    var xx = 0;
		    var yy = 0;
		    var mod = 0;

		    var point_dist = 100000;
		    var line_dist = 100000;

		    for(var n = 0; n < MAX_ITERATIONS; n++) {
		        //Z = Z * Z + c
		        Zy = cy + 2 * Zx * Zy;
		        Zx = cx + xx - yy;

		        xx = Zx * Zx;
		        yy = Zy * Zy;

		        mod = xx + yy;
		        mod2 = Math.min(xx, yy);

		        if( mod < point_dist ) {
		        	point_dist = mod;
		        }

		        if( mod2 < line_dist ) {
		        	line_dist = mod2;
		        }
		    }

		    //return Math.sqrt(Math.sqrt(point_dist));
		    return Math.sqrt(Math.sqrt(line_dist));
		},
	}
}