let fs = require('fs');
let resolvePath = require('path').resolve;

let Stats = fs.Stats

module.exports = {
    /**
     * 
     * @param {string} path 
     * @returns {Promise<string>}
     */
    readFile(path) {
        return new Promise((resolve, reject) => 
            fs.readFile(path, 'utf8',
                (e, data) => e ? reject(e) : resolve(data)
            )
        );
    },

    /**
     * 
     * @param {string} path 
     * @returns {Promise<Stats>}
     */
    stat(path) {
        return new Promise((resolve, reject) => 
            fs.stat(path,(e, data) => e ? reject(e) : resolve(data))
        );
    },

    /**
     * 
     * @param {string} path 
     * @returns {Promise<string[]>}
     */
    readDir(path) {
        return new Promise((resolve, reject) =>
            fs.readdir(path, 'utf8', (e, data) => e ? reject(e) : resolve(data))
        );
    },

    /**
     * 
     * @param {string} dirPath 
     * @return {Promise<string[]>}
     */
    async readDirRecursive(dirPath) {
        let names = await this.readDir(dirPath);
        let paths = names.map(n => resolvePath(dirPath, n));
        let result = [];
        for (let p of paths){
            let stat = await this.stat(p);
            let children = stat.isDirectory()
                ? await this.readDirRecursive(p)
                : [p]
            result.push(...children);
        }
        return result;
    },

    /**
     * 
     * @param {string} path 
     * @param {string} data
     * @return {Promise<void>}
     */
    writeFile(path, data) {
        return new Promise((resolve, reject) =>
            fs.writeFile(path, data, e => e ? reject(e) : resolve())
        );
    }

}