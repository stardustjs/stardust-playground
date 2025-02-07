
    export interface ExampleInfo {
        name: string;
        viewType: "2D" | "3D",
        dataFile: string;
        jsCode: string;
        background: number[];
    }

    export let examples: ExampleInfo[] = [
  {
    "name": "Binning",
    "viewType": "2D",
    "dataFile": "",
    "jsCode": "// Convert the SVG file to Stardust mark spec.\nlet isotype = new Stardust.mark.circle();\n\n// Create the mark object.\nlet isotypes = Stardust.mark.create(isotype, platform);\n\nlet isotypeHeight = 18;\n\nlet xScale = Stardust.scale.linear()\n    .domain([ 0, 1 ])\n    .range([ 20, 28 ]);\nlet yScale = Stardust.scale.linear()\n    .domain([ 0, 1 ])\n    .range([ 468, 460 ]);\n\nlet colors = [[31,119,180],[255,127,14],[44,160,44]];\ncolors = colors.map((x) => [ x[0] / 255, x[1] / 255, x[2] / 255, 1 ]);\n\nisotypes.attr(\"center\", Stardust.scale.Vector2(\n    xScale(d => d % 5),\n    yScale(d => Math.floor(d / 5))\n));\nisotypes.attr(\"radius\", 4.0);\nisotypes.attr(\"color\", [ 0, 0, 0, 1 ]);\n\nisotypes.instance((d, index) => {\n    let data = [];\n    for(let i = 0; i < d * 2; i++) data.push(i);\n    return {\n        data: data,\n        attrs: {\n            color: colors[index % colors.length]\n        },\n        onRender: () => {\n            let offset = 20 + 160 * Math.floor(index / colors.length) + (index % colors.length) * 45;\n            xScale.range([ offset, 8 + offset ]);\n        }\n    };\n});\n\nisotypes.data([\n    27, 53, 91, 52, 112, 42, 107, 91, 68, 56, 115, 86, 26, 102, 28, 23, 119, 110\n]);\n\nfunction render() {\n    isotypes.render();\n}\n",
    "background": [
      1,
      1,
      1,
      1
    ]
  },
  {
    "name": "Simple Bar Chart",
    "viewType": "2D",
    "dataFile": "",
    "jsCode": "var marks = Stardust.mark.compile(`\n    import Rectangle from P2D;\n\n    mark Bar(\n        index: float,\n        height: float,\n        N: float,\n        x0: float = -1, x1: float = 1, ratio: float = 0.9,\n        scale: float = 1,\n        y0: float = 0\n    ) {\n        let step = (x1 - x0) / N;\n        let c = x0 + index * step + step / 2;\n        Rectangle(\n            Vector2(c - step * ratio / 2, y0),\n            Vector2(c + step * ratio / 2, y0 - height * scale)\n        );\n    }\n`);\n\nvar area = Stardust.mark.create(marks.Bar, platform);\narea.attr(\"index\", (d, i) => i);\narea.attr(\"height\", (d, i) => d);\narea.attr(\"x0\", 10.5);\narea.attr(\"x1\", 490.5);\narea.attr(\"N\", 6);\narea.attr(\"y0\", 200);\narea.attr(\"ratio\", 1);\narea.attr(\"scale\", 2);\n\naddSlider(\"Scale\", area, \"scale\", 30, 1, 100);\n\nlet array = [];\n\nfor(let i = 0; i < 100000; i++) array.push(Math.cos(i / 2534) + Math.sin(i /  534));\n\narea.attr(\"N\", array.length);\narea.data(array);\n\nvar bar = Stardust.mark.create(marks.Bar, platform);\nbar.attr(\"index\", (d, i) => i);\nbar.attr(\"height\", (d, i) => d);\nbar.attr(\"x0\", 10);\nbar.attr(\"x1\", 490);\nbar.attr(\"N\", 6);\nbar.attr(\"ratio\", 0.9);\nbar.attr(\"scale\", 30);\nbar.attr(\"y0\", 400);\n\narray = [];\nfor(let i = 0; i < 20; i++) array.push(Math.cos(i) + 2);\nbar.attr(\"N\", array.length);\nbar.data(array);\n\nfunction render() {\n    area.render();\n    bar.render();\n}\n",
    "background": [
      1,
      1,
      1,
      1
    ]
  },
  {
    "name": "Sin 2D",
    "viewType": "2D",
    "dataFile": "",
    "jsCode": "var mark = Stardust.mark.create(Stardust.mark.circle(6), platform);\n\nvar scale = Stardust.scale.custom(`Vector2(cos(k2 * value) * 5 + cos(value * k) * size, sin(value * k) * size + sin(value * k3) * 5) * 30 + Vector2(250, 250)`);\n\nscale.attr(\"k\", 10);\nscale.attr(\"k2\", 3);\nscale.attr(\"k3\", 13.2);\nscale.attr(\"size\", 1);\nmark.attr(\"center\", scale(d => d));\nmark.attr(\"color\", [ 0, 0, 0, 0.1 ]);\nmark.attr(\"radius\", 1);\n\nvar data = [];\nvar N = 100000;\nfor(var k = 0; k < N; k++) {\n    var x = k / N * Math.PI * 10;\n    data.push(x);\n}\nmark.data(data);\n\nfunction render() {\n    mark.render();\n}\nfunction animate(t) {\n    scale.attr(\"k2\", 10 + Math.sin(t / 12) * 5);\n    scale.attr(\"k3\", 10 + Math.sin(t / 10) * 5);\n    scale.attr(\"size\", Math.sin(t));\n}\n",
    "background": [
      1,
      1,
      1,
      1
    ]
  },
  {
    "name": "Sin 3D",
    "viewType": "3D",
    "dataFile": "",
    "jsCode": "var marks = Stardust.mark.compile(`\n    import Triangle from P3D;\n\n    let k1: float;\n    let k2: float;\n    let k3: float;\n\n    function getP(x: float): Vector3 {\n        return Vector3(cos(x * k1), cos(x * k2), cos(x * k3)) * 100;\n    }\n\n    mark Mark(\n        x: float\n    ) {\n        let sz = 1.0;\n        let p = getP(x);\n        let n = getP(x + PI * 2 * 20 / 100000);\n        Triangle(\n            p, p + Vector3(sz, 0, 0), n,\n            Color(0, 0, 0, 0.5)\n        );\n    }\n`);\n\nvar mark = Stardust.mark.create(marks.Mark, platform);\nmark.attr(\"x\", (d) => d);\naddSlider(\"k1\", mark, \"k1\", 16.707, 0, 20);\naddSlider(\"k2\", mark, \"k2\", 14.317, 0, 20);\naddSlider(\"k3\", mark, \"k3\", 17.049, 0, 20);\n\nvar data = [];\nvar N = 100000;\nfor(var k = 0; k < N; k++) {\n    var x = k / N * Math.PI * 2 * 20;\n    data.push(x);\n}\nmark.data(data);\n\nfunction render() {\n    mark.render();\n}\n",
    "background": [
      1,
      1,
      1,
      1
    ]
  },
  {
    "name": "SandDance",
    "viewType": "3D",
    "dataFile": "data/demovoteclean.tsv",
    "jsCode": "let demovote = DATA;\n\nlet mark = Stardust.mark.compile(`\n    import Cube from P3D;\n\n    let longitude: float;\n    let latitude: float;\n    let state: float;\n    let stateBinIndex: float;\n    let xBin: float;\n    let yBin: float;\n    let xyBinIndex: float;\n    let index: float;\n\n    function getPositionScatterplot(): Vector3 {\n        let scaleX = 0.15;\n        let scaleY = 0.22;\n        return Vector3(\n            scaleX * (longitude - (-95.9386152570054)),\n            scaleY * (latitude - (37.139536624928695)),\n            0\n        );\n    }\n\n    function getPositionStateBins(): Vector3 {\n        return Vector3(\n            (state - 48 / 2) * 0.2 + (stateBinIndex % 10 - 4.5) * 0.012,\n            floor(stateBinIndex / 10) * 0.012 - 1.0, 0\n        );\n    }\n\n    function getPositionXYBinning(): Vector3 {\n        let n = 5;\n        let txy = xyBinIndex % (n * n);\n        let tx = txy % n;\n        let ty = floor(txy / n);\n        let tz = floor(xyBinIndex / (n * n));\n        return Vector3(\n            (xBin - 9 / 2) * 0.6 + (tx - n / 2 + 0.5) * 0.02,\n            tz * 0.02 - 2.0,\n            (yBin - 6 / 2) * 0.6 + (ty - n / 2 + 0.5) * 0.02\n        );\n    }\n\n    function clamp01(t: float): float {\n        if(t < 0) t = 0;\n        if(t > 1) t = 1;\n        return t;\n    }\n\n    mark Mark(color: Color, t1: float, t2: float, t3: float, ki1: float, ki2: float, ki3: float) {\n        let p1 = getPositionScatterplot();\n        let p2 = getPositionStateBins();\n        let p3 = getPositionXYBinning();\n        let p = p1 * clamp01(t1 + ki1 * index) +\n            p2 * clamp01(t2 + ki2 * index) +\n            p3 * clamp01(t3 + ki3 * index);\n        Cube(\n            p * 50,\n            0.25,\n            color\n        );\n    }\n`)[\"Mark\"];\nlet marks = Stardust.mark.create(mark, platform);\n\ndemovote.forEach(d => {\n    d.Longitude = +d.Longitude;\n    d.Latitude = +d.Latitude;\n});\n\nlet longitudeExtent = d3.extent(demovote, d => d.Longitude);\nlet latitudeExtent = d3.extent(demovote, d => d.Latitude);\n\nlet longitudeScale = d3.scale.linear().domain(longitudeExtent).range([ 0, 1 ])\nlet latitudeScale = d3.scale.linear().domain(latitudeExtent).range([ 0, 1 ])\n\n// Map states to integer.\nlet states = new Set();\nlet state2number = {};\nlet state2count = {};\ndemovote.forEach(d => states.add(d.StateAbb));\nstates = Array.from(states);\nstates.sort();\nstates.forEach((d, i) => {\n    state2number[d] = i;\n    state2count[d] = 0;\n});\n\nlet xyBinCounter = {};\n\nlet xBinCount = 10;\nlet yBinCount = 7;\n\ndemovote.sort((a, b) => a.Obama - b.Obama);\ndemovote.forEach((d, i) => {\n    d.index = i;\n    if(state2count[d.StateAbb] == null) state2count[d.StateAbb] = 0;\n    d.stateBinIndex = state2count[d.StateAbb]++;\n\n    let xBin = Math.floor(longitudeScale(d.Longitude) * xBinCount);\n    let yBin = Math.floor(latitudeScale(d.Latitude) * yBinCount);\n    let bin = yBin * (xBinCount + 1) + xBin;\n    d.xBin = xBin;\n    d.yBin = yBin;\n    if(xyBinCounter[bin] == null) xyBinCounter[bin] = 0;\n    d.xyBinIndex = xyBinCounter[bin]++;\n});\n\n\nlet s1 = d3.interpolateLab(\"#f7f7f7\", \"#0571b0\");\nlet s2 = d3.interpolateLab(\"#f7f7f7\", \"#ca0020\");\n\nlet strToRGBA = (str) => {\n    let rgb = d3.rgb(str);\n    return [ rgb.r / 255, rgb.g / 255, rgb.b / 255, 1 ];\n}\n\nlet scaleColor = (value) => {\n    if(value > 0.5) {\n        return strToRGBA(s1((value - 0.5) * 2));\n    } else {\n        return strToRGBA(s2((0.5 - value) * 2));\n    }\n}\n\nmarks\n    .attr(\"index\", d => d.index / (demovote.length - 1))\n    .attr(\"longitude\", d => d.Longitude)\n    .attr(\"latitude\", d => d.Latitude)\n    .attr(\"state\", (d) => state2number[d.StateAbb])\n    .attr(\"stateBinIndex\", (d) => d.stateBinIndex)\n    .attr(\"xBin\", (d) => d.xBin)\n    .attr(\"yBin\", (d) => d.yBin)\n    .attr(\"xyBinIndex\", (d) => d.xyBinIndex)\n    .attr(\"color\", (d) => scaleColor(d.Obama));\n\nfunction setT(t) {\n    if(t >= 0 && t <= 1) {\n        let tt = t * 1.3 - 0.3;\n        marks.attr(\"t1\", 1 - tt).attr(\"t2\", tt).attr(\"t3\", 0).attr(\"ki1\", -0.3).attr(\"ki2\", +0.3).attr(\"ki3\", 0);\n    } else if(t >= 1 && t <= 2) {\n        marks.attr(\"t1\", 0).attr(\"t2\", 1).attr(\"t3\", 0).attr(\"ki1\", 0).attr(\"ki2\", 0).attr(\"ki3\", 0);\n    } else if(t >= 2 && t <= 3) {\n        let tt = (t - 2) * 1.3 - 0.3;\n        marks.attr(\"t1\", 0).attr(\"t2\", 1 - tt).attr(\"t3\", tt).attr(\"ki1\", 0).attr(\"ki2\", -0.3).attr(\"ki3\", +0.3);\n    } else if(t >= 3 && t <= 4) {\n        marks.attr(\"t1\", 0).attr(\"t2\", 0).attr(\"t3\", 1).attr(\"ki1\", 0).attr(\"ki2\", 0).attr(\"ki3\", 0);\n    } else if(t >= 4 && t <= 5) {\n        let tt = (t - 4) * 1.3 - 0.3;\n        marks.attr(\"t1\", tt).attr(\"t2\", 0).attr(\"t3\", 1 - tt).attr(\"ki1\", +0.3).attr(\"ki2\", 0).attr(\"ki3\", -0.3);\n    } else {\n        marks.attr(\"t1\", 1).attr(\"t2\", 0).attr(\"t3\", 0).attr(\"ki1\", 0).attr(\"ki2\", 0).attr(\"ki3\", 0);\n    }\n}\n\nmarks.data(demovote);\n\nfunction render() {\n    marks.render();\n}\n\nfunction animate(t) {\n    t = t % 6;\n    setT(t);\n}\n",
    "background": [
      0,
      0,
      0,
      1
    ]
  },
  {
    "name": "Squares",
    "viewType": "2D",
    "dataFile": "data/mnist.csv",
    "jsCode": "var marks = Stardust.mark.compile(`\n    import Rectangle, OutlinedRectangle from P2D;\n\n    let size: float = 2;\n    let spacing: float = 3;\n    let x0: float = 10;\n    let xSpacing: float = 85;\n    let y1: float = 700;\n    let binSpacing: float = 47;\n\n    let CMsp: float = 1.6;\n    let CMspacing: float = 55;\n    let CMx0: float = 50;\n    let CMy0: float = 110;\n\n    let t: float = 0;\n\n    let binIx: float;\n    let binIy: float;\n    let CMIx: float;\n    let CMIy: float;\n    let CMwh: float;\n    let bin: float;\n    let assigned: float;\n    let label: float;\n    let color: Color;\n\n    mark BinnedSquare() {\n        let x = x0 + xSpacing * assigned;\n        let y = y1 - bin * binSpacing;\n        let bx = binIx * spacing;\n        let by = binIy * spacing;\n        x = x + bx;\n        y = y + by;\n        let p1a = Vector2(x, y);\n        let p2a = Vector2(x + size, y + size);\n        let CMx = CMx0 + assigned * CMspacing;\n        let CMy = CMy0 + label * CMspacing;\n        let dx = CMsp * CMIx;\n        let dy = CMsp * CMIy;\n        CMx = CMx + dx - CMwh / 2 * CMsp;\n        CMy = CMy + dy - CMwh / 2 * CMsp;\n        let p1b = Vector2(CMx, CMy);\n        let p2b = Vector2(CMx + size, CMy + size);\n        Rectangle(p1a * (1 - t) + p1b * t, p2a * (1 - t) + p2b * t, color);\n    }\n\n    mark BinnedOutlinedSquare() {\n        let x = x0 + xSpacing * label;\n        let y = y1 - bin * binSpacing;\n        let bx = binIx * spacing;\n        let by = binIy * spacing;\n        x = x - bx - spacing;\n        y = y + by;\n        let p1a = Vector2(x, y);\n        let p2a = Vector2(x + size, y + size);\n        let CMx = CMx0 + assigned * CMspacing;\n        let CMy = CMy0 + label * CMspacing;\n        let dx = CMsp * CMIx;\n        let dy = CMsp * CMIy;\n        CMx = CMx + dx - CMwh / 2 * CMsp;\n        CMy = CMy + dy - CMwh / 2 * CMsp;\n        let p1b = Vector2(CMx, CMy);\n        let p2b = Vector2(CMx + size, CMy + size);\n        OutlinedRectangle(p1a * (1 - t) + p1b * t, p2a * (1 - t) + p2b * t, 0.5, color);\n    }\n`);\n\nvar Nbins = 15;\nvar Nclasses = 10;\nvar CM = [];\nvar CMBin = [];\n\nvar instances = DATA.map(function(d) {\n    return {\n        label: parseInt(d.Label.substr(1)),\n        assigned: parseInt(d.Assigned.substr(1)),\n        score: d[d.Assigned],\n        scoreBin: Math.min(Nbins - 1, Math.max(0, Math.floor(parseFloat(d[d.Assigned]) * Nbins)))\n    };\n});\n\nfor(var i = 0; i < Nclasses; i++) {\n    CM[i] = [];\n    CMBin[i] = [];\n    for(var j = 0; j < Nclasses; j++) {\n        CM[i][j] = 0;\n        CMBin[i][j] = [];\n        for(var k = 0; k < Nbins; k++) {\n            CMBin[i][j][k] = 0;\n        }\n    }\n}\n\ninstances.sort(function(a, b) {\n    if(a.label == a.assigned) return b.label == b.assigned ? 0 : +1;\n    if(b.label == b.assigned) return a.label == a.assigned ? 0 : -1;\n    if(a.assigned != b.assigned)\n        return a.assigned - b.assigned;\n    if(a.label != b.label)\n        return a.label - b.label;\n    return a.score - b.score;\n})\n\ninstances.forEach(function(d) {\n    d.CMIndex = CM[d.label][d.assigned];\n    CM[d.label][d.assigned] += 1;\n    d.binIndex = CMBin[0][d.assigned][d.scoreBin];\n    CMBin[0][d.assigned][d.scoreBin] += 1;\n});\n\ninstances.sort(function(a, b) {\n    if(a.label == a.assigned) return b.label == b.assigned ? 0 : +1;\n    if(b.label == b.assigned) return a.label == a.assigned ? 0 : -1;\n    if(a.assigned != b.assigned)\n        return -(a.assigned - b.assigned);\n    if(a.label != b.label)\n        return a.label - b.label;\n    return a.score - b.score;\n})\n\ninstances.forEach(function(d) {\n    d.binIndex2 = CMBin[1][d.label][d.scoreBin];\n    CMBin[1][d.label][d.scoreBin] += 1;\n});\n\ninstances.forEach(function(d) {\n    d.CMCount = CM[d.label][d.assigned];\n});\n\nvar colors = [[31,119,180],[255,127,14],[44,160,44],[214,39,40],[148,103,189],[140,86,75],[227,119,194],[127,127,127],[188,189,34],[23,190,207]];\ncolors = colors.map((x) => [ x[0] / 255, x[1] / 255, x[2] / 255, 1 ]);\n\nvar mark = Stardust.mark.create(marks.BinnedSquare, platform);\nmark.attr(\"color\", (d) => colors[d.label]);\nmark.attr(\"label\", (d) => d.label);\nmark.attr(\"assigned\", (d) => d.assigned);\nmark.attr(\"binIx\", (d) => Math.floor(d.binIndex / 15));\nmark.attr(\"binIy\", (d) => d.binIndex % 15);\nmark.attr(\"CMwh\", (d) => Math.ceil(Math.sqrt(d.CMCount)));\nmark.attr(\"CMIx\", (d) => Math.floor(d.CMIndex / mark.attr(\"CMwh\")(d)));\nmark.attr(\"CMIy\", (d) => d.CMIndex % mark.attr(\"CMwh\")(d));\nmark.attr(\"bin\", (d) => d.scoreBin);\n\nvar mark2 = Stardust.mark.create(marks.BinnedOutlinedSquare, platform);\nmark2.attr(\"color\", (d) => colors[d.assigned]);\nmark2.attr(\"label\", (d) => d.label);\nmark2.attr(\"assigned\", (d) => d.assigned);\nmark2.attr(\"binIx\", (d) => Math.floor(d.binIndex2 / 15));\nmark2.attr(\"binIy\", (d) => d.binIndex2 % 15);\nmark2.attr(\"CMwh\", (d) => Math.ceil(Math.sqrt(d.CMCount)));\nmark2.attr(\"CMIx\", (d) => Math.floor(d.CMIndex / mark2.attr(\"CMwh\")(d)));\nmark2.attr(\"CMIy\", (d) => d.CMIndex % mark2.attr(\"CMwh\")(d));\nmark2.attr(\"bin\", (d) => d.scoreBin);\n\naddSlider(\"t\", mark, \"t\", 0, 0, 1);\n\nmark.data(instances);\nmark2.data(instances.filter((d) => d.label != d.assigned));\n\nfunction render() {\n    mark2.attr(\"t\", mark.attr(\"t\"));\n    mark2.render();\n    mark.render();\n}\n",
    "background": [
      1,
      1,
      1,
      1
    ]
  },
  {
    "name": "Parallel Coordinates",
    "viewType": "2D",
    "dataFile": "data/mnist.csv",
    "jsCode": "var marks = Stardust.mark.compile(`\n    import Triangle from P2D;\n\n    mark PCLine(\n        p1: Vector2,\n        p2: Vector2,\n        width: float,\n        color: Color\n    ) {\n        let w2 = width / (p1.x - p2.x) * (p1.y - p2.y);\n        let s = sqrt(width * width + w2 * w2) / 2;\n        let m1 = Vector2(p1.x, p1.y + s);\n        let m2 = Vector2(p1.x, p1.y - s);\n        let n1 = Vector2(p2.x, p2.y + s);\n        let n2 = Vector2(p2.x, p2.y - s);\n        Triangle(m1, m2, n1, color);\n        Triangle(m2, n2, n1, color);\n    }\n\n    mark PC(\n        x0: float, x1: float, x2: float,\n        y0: float, y1: float, y2: float,\n        alpha: float,\n        color: Color\n    ) {\n        PCLine(Vector2(x0, y0), Vector2(x1, y1), 1, color);\n        PCLine(Vector2(x1, y1), Vector2(x2, y2), 1, color);\n    }\n`);\n\nvar mark = Stardust.mark.create(marks.PC, platform);\n\nvar instances = DATA.map(function(d) {\n    return {\n        C0: +d.C0, C1: +d.C1, C2: +d.C2, C3: +d.C3, C4: +d.C4,\n        C5: +d.C5, C6: +d.C6, C7: +d.C7, C8: +d.C8, C9: +d.C9,\n        assigned: parseInt(d.Assigned.substr(1))\n    };\n});\n\nvar colors = [[31,119,180],[255,127,14],[44,160,44],[214,39,40],[148,103,189],[140,86,75],[227,119,194],[127,127,127],[188,189,34],[23,190,207]];\ncolors = colors.map((x) => [ x[0] / 255, x[1] / 255, x[2] / 255, 0.1 ]);\n\nvar mY = Stardust.scale.log().domain([ 0.01, 1 ]).range([ 500, 100 ]);\n\nvar xScale = d3.scale.linear().domain([ 0, 2 ]).range([ 100, 700 ]);\nmark.attr(\"y0\", mY((d) => d.C0)).attr(\"x0\", xScale(0));\nmark.attr(\"y1\", mY((d) => d.C1)).attr(\"x1\", xScale(1));\nmark.attr(\"y2\", mY((d) => d.C2)).attr(\"x2\", xScale(2));\nmark.attr(\"color\", (d) => colors[d.assigned]);\nmark.data(instances);\n\naddSlider(\"Alpha\", mark, \"alpha\", 0.02, 0, 0.1);\n\nfunction render() {\n    mark.render();\n}\n",
    "background": [
      1,
      1,
      1,
      1
    ]
  },
  {
    "name": "Parallel Coordinates (Polylines)",
    "viewType": "2D",
    "dataFile": "data/mnist.csv",
    "jsCode": "var polyline = Stardust.mark.polyline();\nvar mark = Stardust.mark.create(polyline, platform);\n\nvar instances = DATA.map(function(d) {\n    return {\n        C0: +d.C0, C1: +d.C1, C2: +d.C2, C3: +d.C3, C4: +d.C4,\n        C5: +d.C5, C6: +d.C6, C7: +d.C7, C8: +d.C8, C9: +d.C9,\n        assigned: parseInt(d.Assigned.substr(1))\n    };\n});\n\nvar colors = [[31,119,180],[255,127,14],[44,160,44],[214,39,40],[148,103,189],[140,86,75],[227,119,194],[127,127,127],[188,189,34],[23,190,207]];\ncolors = colors.map((x) => [ x[0] / 255, x[1] / 255, x[2] / 255, 0.5 ]);\n\nvar yScale = Stardust.scale.linear().domain([ 0, 1 ]).range([ 500, 100 ]);\nvar xScale = Stardust.scale.linear().domain([ 0, 9 ]).range([ 100, 700 ]);\n\nmark.attr(\"p\", Stardust.scale.Vector2(\n    xScale(d => d[0]),\n    yScale(d => d[1])\n));\nmark.attr(\"width\", 1);\nmark.attr(\"color\", [ 0, 0, 0, 1 ]);\n\nlet indices = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];\nlet convertInstance = (inst) => indices.map(i => [i, inst[\"C\" + i]]);\n\nmark.instance((d) => {\n    return {\n        data: convertInstance(d),\n        attrs: {\n            color: colors[d.assigned]\n        }\n    }\n})\n\nmark.data(instances.slice(0, 300));\n\naddSlider(\"Width\", mark, \"width\", 1, 0, 2);\n\nfunction render() {\n    mark.render();\n}\n",
    "background": [
      1,
      1,
      1,
      1
    ]
  },
  {
    "name": "Facebook Graph",
    "viewType": "2D",
    "dataFile": "data/facebook_1912.json",
    "jsCode": "var snodes = Stardust.mark.create(Stardust.mark.circle(8), platform);\nvar sedges = Stardust.mark.create(Stardust.mark.line(), platform);\n\nvar width = 600;\nvar height = 600;\n\nvar nodes = DATA.nodes;\nvar edges = DATA.edges;\nvar N = nodes.length;\n\nfor(var i = 0; i < N; i++) {\n    nodes[i].x = Math.random() * width;\n    nodes[i].y = Math.random() * height;\n}\n\nsnodes.attr(\"center\", (d) => [ d.x, d.y ]);\nsnodes.attr(\"radius\", 3);\nsnodes.attr(\"color\", [ 0, 0, 0, 0.5 ]);\nsedges.attr(\"p1\", (d) => [ d.source.x, d.source.y ]);\nsedges.attr(\"p2\", (d) => [ d.target.x, d.target.y ]);\nsedges.attr(\"color\", [ 0, 0, 0, 0.02 ]);\n\nvar force = d3.layout.force()\n    .size([ width, height ])\n    .nodes(nodes)\n    .links(edges);\n\nforce.linkStrength(0.05);\nforce.gravity(0.2);\nforce.linkDistance(100);\nforce.start();\nforce.on(\"tick\", () => {\n    snodes.data(nodes);\n    sedges.data(edges);\n    reRender();\n});\n\nfunction render() {\n    sedges.render();\n    snodes.render();\n}\n\nfunction finalize() {\n    force.stop();\n}\n",
    "background": [
      1,
      1,
      1,
      1
    ]
  },
  {
    "name": "Facebook Graph (D3-based Version)",
    "viewType": "2D",
    "dataFile": "data/facebook_1912.json",
    "jsCode": "var width = 600;\nvar height = 600;\n\nvar nodes = DATA.nodes;\nvar edges = DATA.edges;\nvar N = nodes.length;\n\nfor(var i = 0; i < N; i++) {\n    nodes[i].x = Math.random() * width;\n    nodes[i].y = Math.random() * height;\n}\n\nvar sedges = svg.selectAll(\"line\").data(edges);\nsedges.enter().append(\"line\");\nvar snodes = svg.selectAll(\"circle\").data(nodes);\nsnodes.enter().append(\"circle\");\n\nsnodes.attr(\"cx\", (d) => d.x);\nsnodes.attr(\"cy\", (d) => d.y);\nsnodes.attr(\"r\", 2);\nsedges.attr(\"x1\", (d) => d.source.x);\nsedges.attr(\"y1\", (d) => d.source.y);\nsedges.attr(\"x2\", (d) => d.target.x);\nsedges.attr(\"y2\", (d) => d.target.y);\n\nsnodes.style(\"fill\", \"rgba(0, 0, 0, 0.5)\");\nsedges.style(\"stroke\", \"rgba(0, 0, 0, 0.02)\");\n\nvar force = d3.layout.force()\n    .size([ width, height ])\n    .nodes(nodes)\n    .links(edges);\n\nforce.linkStrength(0.05);\nforce.gravity(0.2);\nforce.linkDistance(100);\nforce.start();\nforce.on(\"tick\", () => {\n    reRender();\n});\n\nfunction render() {\n    snodes.attr(\"cx\", (d) => d.x);\n    snodes.attr(\"cy\", (d) => d.y);\n    sedges.attr(\"x1\", (d) => d.source.x);\n    sedges.attr(\"y1\", (d) => d.source.y);\n    sedges.attr(\"x2\", (d) => d.target.x);\n    sedges.attr(\"y2\", (d) => d.target.y);\n}\n\nfunction finalize() {\n    force.stop();\n}\n",
    "background": [
      1,
      1,
      1,
      1
    ]
  },
  {
    "name": "Seattle Public Library Dataset",
    "viewType": "3D",
    "dataFile": "data/beethoven.json",
    "jsCode": "let marks = Stardust.mark.compile(`\n    import Triangle from P3D;\n\n    mark Point(\n        center: Vector3,\n        size: float,\n        color: Color\n    ) {\n        let p1 = Vector3(center.x + size, center.y + size, center.z - size);\n        let p2 = Vector3(center.x + size, center.y - size, center.z + size);\n        let p3 = Vector3(center.x - size, center.y + size, center.z + size);\n        let p4 = Vector3(center.x - size, center.y - size, center.z - size);\n        Triangle(p1, p2, p3, color);\n        Triangle(p4, p1, p2, color);\n        Triangle(p4, p2, p3, color);\n        Triangle(p4, p3, p1, color);\n    }\n\n    mark Line(\n        p1: Vector3, p2: Vector3,\n        size: float,\n        color: Color\n    ) {\n        let x1 = Vector3(p1.x, p1.y, p1.z - size);\n        let x2 = Vector3(p1.x, p1.y, p1.z + size);\n        let x3 = Vector3(p2.x, p2.y, p2.z + size);\n        let x4 = Vector3(p2.x, p2.y, p2.z - size);\n        Triangle(x1, x2, x3, color);\n        Triangle(x4, x1, x2, color);\n        Triangle(x4, x2, x3, color);\n        Triangle(x4, x3, x1, color);\n    }\n\n    function getPosition(year: float, dayOfYear: float, secondOfDay: float): Vector3 {\n        let angle = dayOfYear / 366 * PI * 2;\n        let dayScaler = (secondOfDay / 86400 - 0.5);\n        let r = (year - 2006) / (2015 - 2006) * 200 + 50 + dayScaler * 50;\n        let x = cos(angle) * r;\n        let y = sin(angle) * r;\n        let z = dayScaler * 50;\n        return Vector3(x, y, z);\n    }\n\n    function getPosition2(year: float, dayOfYear: float, secondOfDay: float): Vector3 {\n        let angle = dayOfYear / 366 * PI * 2;\n        let r = secondOfDay / 86400 * 200 + 50;\n        let x = cos(angle) * r;\n        let y = sin(angle) * r;\n        let z = 0;\n        return Vector3(x, y, z);\n    }\n\n    mark Glyph(\n        year: float,\n        dayOfYear: float,\n        secondOfDay: float,\n        duration: float,\n        t: float,\n        color: Color\n    ) {\n        let p = getPosition(year, dayOfYear, secondOfDay);\n        let p2 = getPosition2(year, dayOfYear, secondOfDay);\n        Point(p * (1 - t) + p2 * t, log(1 + duration) / 2, color = color);\n    }\n\n    mark LineChart(\n        year1: float,\n        dayOfYear1: float,\n        secondOfDay1: float,\n        year2: float,\n        dayOfYear2: float,\n        secondOfDay2: float,\n        c1: float,\n        c2: float,\n        t: float\n    ) {\n        let p1 = getPosition(year1, dayOfYear1, secondOfDay1);\n        let p1p = getPosition2(year1, dayOfYear1, secondOfDay1);\n        let p2 = getPosition(year2, dayOfYear2, secondOfDay2);\n        let p2p = getPosition2(year2, dayOfYear2, secondOfDay2);\n        p1 = p1 + (p1p - p1) * t;\n        p2 = p2 + (p2p - p2) * t;\n        p1 = Vector3(p1.x, p1.y, c1);\n        p2 = Vector3(p2.x, p2.y, c2);\n        Line(p1, p2, 0.5, Color(1, 1, 1, 0.8));\n    }\n`);\n\nlet mark = Stardust.mark.create(marks.Glyph, platform);\nlet lineChart = Stardust.mark.create(marks.LineChart, platform);\n\nDATA.forEach((d) => {\n    d.duration = (d.checkInFirst - d.checkOut) / 86400;\n    d.checkOut = new Date(d.checkOut * 1000);\n    d.checkIn = new Date(d.checkInFirst * 1000);\n});\nDATA = DATA.filter((d) => {\n    if(!d.checkIn || !d.checkOut) return false;\n    if(d.duration > 360) return false;\n    return d.checkOut.getFullYear() >= 2007 && d.checkOut.getFullYear() < 2016 && d.checkIn.getFullYear() >= 2007 && d.checkIn.getFullYear() < 2016;\n});\n\n// Daily summary.\nlet days = new Map();\nDATA.forEach((d) => {\nlet day = Math.floor(d.checkOut.getTime() / 1000 / 86400) * 86400;\nif(!days.has(day)) days.set(day, 1);\nelse days.set(day, days.get(day) + 1);\n});\nlet daysArray = [];\ndays.forEach((count, day) => {\n    daysArray.push({ day: new Date(day * 1000), count: count });\n});\ndaysArray.sort((a, b) => a.day.getTime() - b.day.getTime());\n\nlet colorScale = d3.scale.category10();\nlet color = (d) => {\n    let rgb = d3.rgb(colorScale(d.deweyClass));\n    return [ rgb.r / 255, rgb.g / 255, rgb.b / 255, 0.5 ];\n};\n\nlet dayOfYear = (d) => {\n    return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);\n}\nlet secondOfDay = (d) => {\n    return d.getMinutes() * 60 + d.getHours() * 3600 + d.getSeconds();\n}\nmark.attr(\"duration\", (d) => d.duration);\nmark.attr(\"year\", (d) => d.checkOut.getFullYear());\nmark.attr(\"dayOfYear\", (d) => dayOfYear(d.checkOut));\nmark.attr(\"secondOfDay\", (d) => secondOfDay(d.checkOut));\nmark.attr(\"color\", color);\n// mark.attr(\"inYear\", (d) => d.checkIn.getFullYear());\n// mark.attr(\"inDayOfYear\", (d) => dayOfYear(d.checkIn));\n// mark.attr(\"inSecondOfDay\", (d) => secondOfDay(d.checkIn));\nmark.data(DATA);\n\nlineChart.attr(\"year1\", (d) => d.day.getFullYear());\nlineChart.attr(\"dayOfYear1\", (d) => dayOfYear(d.day));\nlineChart.attr(\"secondOfDay1\", (d) => secondOfDay(d.day));\nlineChart.attr(\"year2\", (d, i) => daysArray[i + 1].day.getFullYear());\nlineChart.attr(\"dayOfYear2\", (d, i) => dayOfYear(daysArray[i + 1].day));\nlineChart.attr(\"secondOfDay2\", (d, i) => secondOfDay(daysArray[i + 1].day));\nlet zScale = Stardust.scale.linear().domain([ 0, d3.max(daysArray, (d) => d.count) ]).range([20, 60]);\nlineChart.attr(\"c1\", zScale((d) => d.count));\nlineChart.attr(\"c2\", zScale((d, i) => daysArray[i + 1].count));\nlineChart.data(daysArray.slice(0, -1));\n\naddSlider(\"t\", mark, \"t\", 0, 0, 1);\n\nfunction render() {\n    lineChart.attr(\"t\", mark.attr(\"t\"));\n    lineChart.render();\n    mark.render();\n}\n",
    "background": [
      1,
      1,
      1,
      1
    ]
  }
];
