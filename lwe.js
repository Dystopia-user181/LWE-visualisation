const c = document.getElementById("c"), ctx = c.getContext("2d");

class Vec2 {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	mul(n) {
		return new Vec2(this.x * n, this.y * n);
	}
	add(other) {
		return new Vec2(this.x + other.x, this.y + other.y);
	}
}

class Matrix2 {
	constructor(a,b,c,d) {
		this.a=a;this.b=b;this.c=c;this.d=d;
	}
	mul(other) {
		if (other instanceof Matrix2) {
			return new Matrix2(
				this.a * other.a + this.b * other.c, this.a * other.b + this.b * other.d,
				this.c * other.a + this.d * other.c, this.c * other.b + this.d * other.d
			)
		} else if (other instanceof Vec2) {
			return new Vec2(
				this.a * other.x + this.b * other.y,
				this.c * other.x + this.d * other.y
			)
		} else {
			return new Matrix2(this.a * other, this.b * other, this.c * other, this.d * other);
		}
	}
	inv() {
		return new Matrix2(this.d, -this.b, -this.c, this.a).mul(1/(this.a * this.d - this.b * this.c));
	}
}

function canvas_arrow(context, fromx, fromy, tox, toy) {
	var headlen = 0.3; // length of head in pixels
	var dx = tox - fromx;
	var dy = toy - fromy;
	var angle = Math.atan2(dy, dx);
	context.beginPath();
	context.moveTo(fromx, fromy);
	context.lineTo(tox, toy);
	context.stroke();
	context.beginPath();
	context.moveTo(tox, toy);
	context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 4), toy - headlen * Math.sin(angle - Math.PI / 4));
	context.stroke();
	context.beginPath();
	context.moveTo(tox, toy);
	context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 4), toy - headlen * Math.sin(angle + Math.PI / 4));
	context.stroke();
}

const b1 = [new Vec2(1, 2), new Vec2(2, 0)],
m1 = new Matrix2(1, 2, 2, 0),
b2 = [new Vec2(-9, 10), new Vec2(-4, 4)],
m2 = new Matrix2(-9, -4, 10, 4);
let b = b1, m = m1;
let v = new Vec2(0, 0);

function reEstimate() {
	const vEst = m.inv().mul(v);
	
	document.getElementById("vu").innerText =
		`v = ${vEst.x.toFixed(2)}u1 + ${vEst.y.toFixed(2)}u2 ≈ ${vEst.x.toFixed(0)}u1 + ${vEst.y.toFixed(0)}u2`
}

document.getElementById("switchbasis").addEventListener("change", () => {
	b = document.getElementById("switchbasis").checked ? b2 : b1;
	m = document.getElementById("switchbasis").checked ? m2 : m1;
	reEstimate();
	document.getElementById("basistext").innerText = `Current Basis: u1=(${b[0].x},${b[0].y}), u2=(${b[1].x},${b[1].y})`;
});

c.addEventListener("click", e => {
	v.x = (e.offsetX / innerWidth - 0.5) * 46;
	v.y = ((innerHeight / 2 - e.offsetY) / innerWidth) * 46;
	reEstimate();
	document.getElementById("vtext").innerText = `Current Vector: v=(${v.x.toFixed(2)},${v.y.toFixed(2)})`;
});

function render() {
	c.width = innerWidth;
	c.height = innerHeight;
	ctx.resetTransform();
	ctx.translate(innerWidth/2, innerHeight/2);
	ctx.scale(innerWidth/46, -innerWidth/46);
	for (let i = -23; i < 24; i++) {
		ctx.fillStyle = i === 0 ? "#fff5" : "#8885";
		ctx.fillRect(-23, i - 0.02, 46, 0.04);
		ctx.fillRect(i - 0.02, -23, 0.04, 46);
	}
	ctx.lineWidth = 0.1
	ctx.lineCap = "round";
	ctx.strokeStyle = "#f80";
	canvas_arrow(ctx, 0, 0, b[0].x, b[0].y);
	ctx.strokeStyle = "#66f";
	canvas_arrow(ctx, 0, 0, b[1].x, b[1].y);
	for (let i = -101; i < 102; i++) {
		for (let j = -101; j < 102; j++) {
			const {x, y} = b[0].mul(i).add(b[1].mul(j));
			i1 = Math.sin(i/10*3.14) * 125 + 125;
			i2 = Math.sin(j/10*3.14) * 125 + 125;
			ctx.fillStyle = `rgb(${i1}, ${250-i1}, ${i2})`;
			ctx.beginPath();
			ctx.arc(x, y, 0.1, 0, 6.29);
			ctx.fill();
		}
	}
	if (v.x != 0 || v.y != 0) {
		let vEst = m.inv().mul(v);
		i1 = Math.sin(vEst.x/10*3.14) * 125 + 125;
		i2 = Math.sin(vEst.y/10*3.14) * 125 + 125;
		ctx.strokeStyle = `rgb(${i1}, ${250-i1}, ${i2})`;
		canvas_arrow(ctx, 0, 0, v.x, v.y);
		ctx.strokeStyle = `#fff9`;
		ctx.setLineDash([0.2, 0.2]);
		vEst.x = Math.round(vEst.x);
		vEst.y = Math.round(vEst.y);
		vEst = m.mul(vEst);
		canvas_arrow(ctx, 0, 0, vEst.x, vEst.y);
		ctx.setLineDash([]);
	}
	requestAnimationFrame(render);
}
render();
