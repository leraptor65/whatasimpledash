const Fuse = require('fuse.js');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('current_config.json', 'utf8'));

// Flatten and deduplicate all services for search
const services = [];
const seenUrls = new Set();
const addUnique = (sList) => {
    sList.forEach(s => {
    if (!s.hidden) {
        const uniqueKey = `${s.name}-${s.url}`;
        if (!seenUrls.has(uniqueKey)) {
        seenUrls.add(uniqueKey);
        services.push(s);
        }
    }
    });
};

if (config.groups) {
    config.groups.forEach(group => {
    if (group.services) addUnique(group.services);
    });
}
if (config.services) {
    addUnique(config.services);
}

const fuse = new Fuse(services, {
    keys: ['name', 'subtitle', 'url'],
    threshold: 0.3,
});

console.log("Total unique services:", services.length);
let results = fuse.search("Proxmox");
console.log("Search for 'Proxmox':", results.map(r => r.item.name).length, "results");

results = fuse.search("mox");
console.log("Search for 'mox':", results.map(r => r.item.name).length, "results");

results = fuse.search("Home");
console.log("Search for 'Home':", results.map(r => r.item.name).length, "results");
