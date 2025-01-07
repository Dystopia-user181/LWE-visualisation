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
	dot(other) {
		let vvv = 0;
		for (let i = 0; i < 4; i++) {
			vvv += this.a[i] * other.a[i];
		}
		return vvv % m;
	}
	randomise(small=false) {
		for (let i = 0; i < 4; i++) {
			this.a[i] = (Math.floor(Math.random() * (small ? 7 : m) - (small ? 3 : 0)) + m) % m;
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
	
	get T() {
		let result = new Matrix();
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				result.m[i][j] = this.m[j][i];
			}
		}
		return result;
	}
}

let LHS = new Matrix();
LHS.randomise();
let s = new Vec();
let E = new Vec();
s.randomise(true);
E.randomise(true);
let RHS = LHS.mul(s);

const varname = "wxyz";

function formatPM(u) {
	if (u == 0) return "0";
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
	u.randomise();
	s.randomise(true);
	E.randomise(true);
	RHS = LHS.mul(s);
	updateEquations();
});

let u = new Vec();
u.randomise(true);
let BobLHS = LHS.T.mul(u), BobRHS = u.dot(RHS.add(E));
let E1 = new Vec();
E1.randomise(true);
let E2 = (Math.floor(Math.random() * 7 - 3) + m) % m;

function bit(x) {
	return x < m/4 || x > 0.75 * m ? 0 : 1;
}
function updateEquations2() {
	let eqString = "";
	for (let i = 0; i < 4; i++) {
		eqString += `<span>${BobLHS.a[i]}${varname[i]}</span><span>${i === 3 ? '=' : '+'}</span>`;
	}
	eqString += `<span>${BobRHS}</span>`;
	eqString += `<span></span>`;
	eqString += "<span>(mod 1009)</span>";
	for (let i = 0; i < 4; i++) {
		eqString += `<span class="errors">${formatPM(E1.a[i])}</span><span></span>`;
	}
	eqString += `<span class="errors">${formatPM(E2)}</span>`;
	document.getElementById("bob").innerHTML = eqString;
	let al = (s.dot(BobLHS.add(E1)) - E2 - BobRHS + 3 * m) % m;
	document.getElementById("a-est").innerHTML = `${al} --> "${bit(al)}"`;
	let estimate = (LHS.inv().mul(RHS.add(E)).dot(BobLHS.add(E1)) - E2 - BobRHS + 3 * m) % m;
	document.getElementById("me-est").innerHTML = `${estimate} --> "${bit(estimate)}"`;
}

document.getElementById("random-eq2").addEventListener("click", () => {
	u.randomise(true);
	BobLHS = LHS.T.mul(u);
	BobRHS = u.dot(RHS.add(E));
	E1.randomise(true);
	E2 = (Math.floor(Math.random() * 7 - 3) + m) % m;
	updateEquations2();
});