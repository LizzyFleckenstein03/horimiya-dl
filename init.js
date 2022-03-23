// GPLv3 License
const fs = require("fs")
const download = require("download")
const cliProgress = require("cli-progress")
const unzipper = require("unzipper")
const pdfkit = require("pdfkit")

const url = "http://images.mangafreak.net/downloads/Horimiya_"
const chapters = 124

const bar = new cliProgress.SingleBar({}, cliProgress.Presets.legacy)
bar.start(chapters, 0, { speed: "N/A" })

const doc = new pdfkit({autoFirstPage: false})
doc.pipe(fs.createWriteStream("Horimiya.pdf"))

fs.promises.rm("pages", {recursive: true, force: true})
	.then(_ => fs.promises.mkdir("pages"))
	.then(_ => Promise.all(new Array(chapters)
		.fill(null)
		.map((_, i) => i + 1)
		.map(n => download(url + n)
			.pipe(unzipper.Extract({ path: "pages" }))
			.promise()
			.then(_ => bar.increment())	
		)
	))
	.then(_ => bar.stop())
	.then(_ => fs.promises.readdir("pages"))
	.then(files => files
		.sort(new Intl.Collator(undefined, { numeric: true }).compare)
		.map(file => "pages/" + file)
		.map(file => doc.openImage(file))
		.forEach(img => doc.addPage({size: [img.width, img.height]}).image(img, 0, 0))
	)
	.then(_ => doc.end())
