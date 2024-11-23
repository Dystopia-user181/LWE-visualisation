const m = 1009;

function bigMod(a, n) {
	let x = a, r = 1;
	while (n > 0 && x != 1) {
		if (n & 1) r = (r * x) % m;
		x = (x * x) % m;
		n >>= 1;
	}
	return r;
}

function inv(a) { return bigMod(a, m - 2); }

class Vec {
	constructor(arr = [0, 0, 0, 0]) {
		this.a = arr.slice();
	}
	mul(n) {
		return new Vec(this.a.map(x => (x * n) % m));
	}
	add(other) {
		return new Vec(this.a.map((x, idx) => (x + other.a[idx]) % m));
	}
	randomise(small=false) {
		for (let i = 0; i < 4; i++) {
			this.a[i] = Math.floor(Math.random() * (small ? 7 : m) - (small ? 3 : 0));
		}
	}
}

class Matrix {
	constructor(arr = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]) {
		this.m = arr.map(x => x.slice());
	}
	mul(other) {
		if (other instanceof Matrix) {
			let result = new Matrix();
			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < 4; j++) {
					for (let k = 0; k < 4; k++) {
						result.m[i][j] += this.m[i][k] * other.m[k][j];
					}
					result.m[i][j] %= m;
				}
			}
			return result;
		} else if (other instanceof Vec) {
			let result = new Vec();
			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < 4; j++) {
					result.a[i] += this.m[i][j] * other.a[j];
				}
				result.a[i] %= m;
			}
			return result;
		} else {
			return new Matrix(this.m.map(x => x.map(y => (y * other) % m)));
		}
	}
	inv() {
		let left = new Matrix(this.m);
		let result = new Matrix();
		result.m[0][0] = result.m[1][1] = result.m[2][2] = result.m[3][3] = 1;
		// Forward elimination
		for (let i = 0; i < 3; i++) {
			for (let j = i + 1; j < 4; j++) {
				let factor = m - (left.m[j][i] * inv(left.m[i][i])) % m;
				left.m[j] = left.m[j].map((x, idx) => (x + left.m[i][idx] * factor) % m);
				result.m[j] = result.m[j].map((x, idx) => (x + result.m[i][idx] * factor) % m);
			}
		}
		console.log(left.m.map(x => x.slice()), result.m.map(x => x.slice()));
		// Backward elimination
		for (let i = 1; i < 4; i++) {
			for (let j = 0; j < i; j++) {
				let factor = m - (left.m[j][i] * inv(left.m[i][i])) % m;
				left.m[j] = left.m[j].map((x, idx) => (x + left.m[i][idx] * factor) % m);
				result.m[j] = result.m[j].map((x, idx) => (x + result.m[i][idx] * factor) % m);
			}
		}
		console.log(left.m.map(x => x.slice()));
		// Normalise
		for (let i = 0; i < 4; i++) {
			let factor = inv(left.m[i][i]);
			result.m[i] = result.m[i].map(x => (x * factor) % m);
		}
		return result;
	}

	randomise() {
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				this.m[i][j] = Math.floor(Math.random() * m);
			}
		}
	}
}

let LHS = new Matrix();
LHS.randomise();
let RHS = new Vec();
let E = new Vec();
RHS.randomise();

const varname = "wxyz";

function formatPM(u) {
	return `${u > 0 ? "+" : "-"}${Math.abs(u)}`
}
function updateEquations() {
	let eqString = "";
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			eqString += `<span>${LHS.m[i][j]}${varname[j]}</span><span>${j === 3 ? '=' : '+'}</span>`;
		}
		eqString += `<span>${RHS.a[i]}</span>`;
		eqString += `<span class="errors">${E.a[i] ? formatPM(E.a[i]) : ""}</span>`;
		eqString += "<span>(mod 1009)</span>";
	}
	document.getElementById("equations").innerHTML = eqString;
	const solved = LHS.inv().mul(RHS).a;
	document.getElementById("solved").innerHTML = solved.map((x, idx) => `${varname[idx]} = ${x}`).join(", ");
	const solvedErr = LHS.inv().mul(RHS.add(E)).a;
	document.getElementById("solved-err").innerHTML = solvedErr.map((x, idx) => `${varname[idx]} = ${x}`).join(", ");
}

updateEquations();

document.getElementById("random-eq").addEventListener("click", () => {
	LHS.randomise();
	RHS.randomise();
	E = new Vec();
	updateEquations();
});

document.getElementById("random-err").addEventListener("click", () => {
	E.randomise(true);
	updateEquations();
});