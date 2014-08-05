window.mandelbrot_plugin_data = {};

function pass_data(dataObj) {
	window.mandelbrot_plugin_data = dataObj;
	return false;
}

var Plugins = {
	mandelbrot: {
		desc: "Mandelbrot Z = Z * Z + c",
		iterator: function(x, y, params) {
			var Zx = 0.0;
		    var Zy = 0.0;

		    var converge = true;
		    var xx = Zx * Zx;
		    var yy = Zy * Zy;
		    var mod = xx + yy;

			for(var n = 0; n < MAX_ITERATIONS; n++) {
		        //Z = Z * Z + c
		        Zy = y + 2 * Zx * Zy;
		        Zx = x + xx - yy;

		        xx = Zx * Zx;
		        yy = Zy * Zy;
		        mod = xx + yy;

		        if( mod > CONVERGENCE_RADIUS_SQ ) {
		            return pass_data({mod: mod, n: n});
		        }
		    }

		    return true;
		},
	},
	mandelbrot_cubic: {
		desc: "Cubic Mandelbrot Z = Z * Z * Z + c",
		iterator: function(x, y, params) {

			var Zx = 0.0;
		    var Zy = 0.0;

		    var converge = true;
		    var xx = Zx * Zx;
		    var yy = Zy * Zy;
		    var mod = xx + yy;

			for(var n = 0; n < MAX_ITERATIONS; n++) {
		        //Z = Z * Z * Z + c
		        Zx = x + xx * Zx - 3 * Zx * yy;
		        Zy = y + 3 * xx * Zy - yy * Zy;

		        xx = Zx * Zx;
		        yy = Zy * Zy;
		        mod = xx + yy;

		        if( mod > CONVERGENCE_RADIUS_SQ ) {
		            return pass_data({mod: mod, n: n});
		        }
		    }

		    return true;
		},
	},
	julia: {
		desc: "Julia Z = Z * Z + c",
		iterator: function(x, y, params) {
			var Zx = x;
		    var Zy = y;

		    var cx = params.cx;
		    var cy = params.cy;

		    var xx = Zx * Zx;
		    var yy = Zy * Zy;
		    var mod = xx + yy;

		    for(var n = 0; n < MAX_ITERATIONS; n++) {
		        //Z = Z * Z + c
		        Zy = cy + 2 * Zx * Zy;
		        Zx = cx + xx - yy;

		        xx = Zx * Zx;
		        yy = Zy * Zy;

		        mod = xx + yy;

		        if( mod > CONVERGENCE_RADIUS_SQ ) {
		            return pass_data({mod: mod, n: n});
		        }
		    }

		    return false;
		},
	}
}