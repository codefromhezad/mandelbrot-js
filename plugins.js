window.mandelbrot_plugin_data = {};

function pass_data(dataObj) {
	window.mandelbrot_plugin_data = dataObj;
	return false;
}

function get_data(dataKey) {
	if( dataKey ) {
		return window.mandelbrot_plugin_data[dataKey];
	} else {
		return window.mandelbrot_plugin_data;
	}
}

var Plugins = {
	fractals: {
		mandelbrot: {
			desc: "Mandelbrot Z = Z * Z + c",
			iterator: function(x, y, params) {
				var Zx = 0.0;
			    var Zy = 0.0;

			    var converge = true;
			    var xx = 0;
			    var yy = 0;
			    var mod = 0;
			    var point_dist = 100000;
			    var line_dist = 100000;

				for(var n = 0; n < MAX_ITERATIONS; n++) {
			        //Z = Z * Z + c
			        Zy = y + 2 * Zx * Zy;
			        Zx = x + xx - yy;

			        xx = Zx * Zx;
			        yy = Zy * Zy;

			        mod = xx * yy;
			        mod2 = Math.min(xx, yy);

			        if( mod < point_dist ) {
			        	point_dist = mod;
			        }

			        if( mod2 < line_dist ) {
			        	line_dist = mod2;
			        }
			    }

			    return pass_data({point_dist: Math.sqrt(point_dist), line_dist: Math.sqrt(line_dist), mod: mod, n: n, degree: 2});
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
			            return pass_data({mod: mod, n: n, degree: 3});
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
			            return pass_data({mod: mod, n: n, degree: 2});
			        }
			    }

			    return false;
			},
		}
	},

	pixelShaders: {
		escape_time: {
			desc: "Escape Time",
			shader: function() {
				return get_data('n') / MAX_ITERATIONS;
			}
		},

		real_escape_time: {
			desc: "Real Escape Time",
			shader: function() {
				var lnDivisor = 1.0 / get_data('degree');

                return (get_data('n') + (Math.log(Math.log(CONVERGENCE_RADIUS)) - Math.log(Math.log(Math.sqrt(get_data('mod'))))) * lnDivisor) / MAX_ITERATIONS;
			}
		},

		point_orbit_trap: {
			desc: "Orbit trap point min(Z)",
			shader: function() {
                return get_data('line_dist');
			}
		}
	}
}