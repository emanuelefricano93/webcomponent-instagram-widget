/**
 * InstagramWidget WebComponent
 * =====================
 * Simple Instagram Widget: Photos Box of your Instagram Profile for your blog or website with this WebComponent.
 *
 * @contributors: Patryk Rzucidło [@ptkdev] <support@ptkdev.io> (https://ptk.dev)
 *
 * @license: MIT License
 *
 */
class InstagramWidget extends HTMLElement {
	constructor() {
		super();

		const template = document.createElement("template");
		template.innerHTML = `<style id="instagram-widget-style">{% include 'css/main.css' %}</style>{% include 'main.html' %}`;

		this.attachShadow({mode: "open"});
		this.shadowRoot.appendChild(template.content.cloneNode(true));
		this.json = null;
		this.options_default = {
			"username": "@ptkdev",
			"items-limit": "9",
			"image-width": "100%",
			"image-height": "100%",
			"grid": "responsive",
			"cache": "enabled",
			"border-spacing": "2px",
			"border-corners": "5"
		};

		this.options = this.options_default;
	}

	build_html() {
		let data = this.json.graphql.user.edge_owner_to_timeline_media.edges;

		let photos = [];

		for (let i=0; i<data.length; i++) {
			photos.push({
				url: `https://www.instagram.com/p/${data[i].node.shortcode}/`,
				thumbnail: data[i].node.thumbnail_src,
				display_url: data[i].node.display_url !== undefined ? data[i].node.display_url : "",
				caption: data[i].node.edge_media_to_caption.edges[0] &&
				data[i].node.edge_media_to_caption.edges[0].node.text !== undefined ? data[i].node.edge_media_to_caption.edges[0].node.text : ""
			});
		}

		let html = "";
		for (let i = 0; i < photos.length && i < this.options["items-limit"]; i++) {
			html += `<li><a href="${photos[i].url}" rel="nofollow external noopener noreferrer" target="_blank" title="${photos[i].caption.substring(0, 100).replace(/"/g, "")}"><img width="${this.options["image-width"]}" height="${this.options["image-height"]}" src="${photos[i].display_url}" alt="${photos[i].caption.substring(0, 100).replace(/"/g, "")}" loading="lazy" /></a></li>`;
		}
		document.querySelector("instagram-widget").shadowRoot.querySelector(".instagram-widget-photos").innerHTML = html;

		if (this.options["grid"] !== "" && this.options["grid"] !== null && this.options["grid"] !== "responsive") {
			let grid = this.options["grid"].split("x");
			let width = 100 / parseInt(grid[0]);
			let images = document.querySelector("instagram-widget").shadowRoot.querySelectorAll(".instagram-widget-photos img");
			for (let i=0; i < images.length; i++) {
				images[i].setAttribute("width", `${(width - 1)}%`);
				images[i].style.maxWidth = "none";
				images[i].style.maxHeight = "none";
				images[i].style.borderRadius = `${this.options["border-corners"]}%`;
				images[i].style.margin = this.options["border-spacing"];
			}
		}
	}
	/**
	 * Get Photos from fetch request
	 * =====================
	 *
	 */
	api_fetch() {
		let self = this;

		let url = `https://www.instagram.com/${this.options["username"].replace("@", "")}/?__a=1`;
		fetch(url, {"cache": this.options["cache"] === null || this.options["cache"] === "enabled" ? "force-cache" : "default"}).then(function(response) {
			if (response.status === 200) {
				return response.json();
			}
		}).then(function(response) {
			self.json = response;
			self.build_html();
		});
	}

	static get observedAttributes() {
		return ["username", "items-limit", "grid", "image-width", "image-height", "border-spacing", "border-corners", "cache"];
	}

	attributeChangedCallback(name_attribute, old_vale, new_value) {
		if (old_vale !== new_value) {
			if (new_value === null || new_value === "") {
				this.options[name_attribute] = this.options_default[name_attribute];
			} else {
				this.options[name_attribute] = new_value;
			}

			switch (name_attribute) {
				case "username":
				  this.api_fetch();
				  break;
				default:
				  if (this.json !== null) {
						this.build_html();
				  }
			  }
		}
	}
}

window.customElements.define("instagram-widget", InstagramWidget);
