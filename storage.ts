import { AsyncDatabase } from "promised-sqlite3";

export class Storage {
    private db: AsyncDatabase|undefined;
    private dbPath: string;
    
    constructor(dbPath: string) {
        this.db = undefined;
        this.dbPath = dbPath;
    }

    public async init() {
        this.db = await AsyncDatabase.open(this.dbPath)
        await this.db.run(`CREATE TABLE IF NOT EXISTS "users" (
            "username"	TEXT NOT NULL,
            "private_key"	TEXT NOT NULL,
            PRIMARY KEY("username")
        )`);

        await this.db.run(`CREATE TABLE IF NOT EXISTS "versions" (
            "product"	TEXT NOT NULL,
            "version"	TEXT NOT NULL,
            "os"	TEXT NOT NULL,
            "arch"	TEXT NOT NULL,
            "tested"	INTEGER NOT NULL DEFAULT 0,
            "published"	INTEGER NOT NULL DEFAULT 0,
            "packed"	INTEGER NOT NULL DEFAULT 0,
            "pack_tested" INTEGER NOT NULL DEFAULT 0,
            "url"	TEXT NOT NULL,
            "commit_sha" TEXT NOT NULL,
            PRIMARY KEY("product", "version","os","arch")
        )`);
    }

    public async getUserPrivate(username: string): Promise<string | undefined> {
        if (!this.db) {
            throw new Error("Database not initialized");
        }
        const result = await this.db.get<any>("SELECT private_key FROM users WHERE username = ?", username);
        return result?.private_key
    }

    public async setVersionUrl(product: string,version: string, os: string, arch: string, url: string, commit: string) {
        if (!this.db) {
            throw new Error("Database not initialized");
        }
        await this.db.run(
            `INSERT OR REPLACE INTO versions (product, version, os, arch, url, commit_sha) VALUES (?, ?, ?, ?, ?, ?)`,
            product, version, os, arch, url, commit
        );
    }

    public async setVersionTestResult(product: string, version: string, os: string, arch: string, tested: boolean) {
        if (!this.db) {
            throw new Error("Database not initialized");
        }
        await this.db.run(
            `UPDATE versions SET tested = ? WHERE product = ? AND version = ? AND os = ? AND arch = ?`,
            tested ? 1 : -1, product, version, os, arch
        );
    }

    public async setVersionPublishResult(product: string, version: string, os: string, arch: string, published: boolean) {
        if (!this.db) {
            throw new Error("Database not initialized");
        }
        await this.db.run(
            `UPDATE versions SET published = ? WHERE product = ? AND version = ? AND os = ? AND arch = ?`,
            published ? 1 : -1, product, version, os, arch
        );
    }

    public async setVersionPackResult(product: string, version: string, os: string, arch: string, packed: boolean) {
        if (!this.db) {
            throw new Error("Database not initialized");
        }
        await this.db.run(
            `UPDATE versions SET packed = ? WHERE product = ? AND version = ? AND os = ? AND arch = ?`,
            packed ? 1 : -1, product, version, os, arch
        );
    }

    public async setVersionPackTestResult(product: string, version: string, os: string, arch: string, pack_tested: boolean) {
        if (!this.db) {
            throw new Error("Database not initialized");
        }
        await this.db.run(
            `UPDATE versions SET pack_tested = ? WHERE product = ? AND version = ? AND os = ? AND arch = ?`,
            pack_tested ? 1 : -1, product, version, os, arch
        );
    }

    public async getVersions(pageNum: number, pageSize: number, product: string|undefined,version: string| undefined, os: string[] | undefined, arch: string[] | undefined, commit: string|undefined, notest: boolean, nopub: boolean, nopack: boolean) {
        if (!this.db) {
            throw new Error("Database not initialized");
        }
        let query = `SELECT * FROM versions WHERE 1=1`;
        const params: any[] = [];

        if (product) {
            query += ` AND product = ?`;
            params.push(product);
        }

        if (version) {
            query += ` AND version = ?`;
            params.push(version);
        }

        if (commit) {
            query += ` AND commit_sha = ?`;
            params.push(commit);
        }

        if (os && os.length > 0) {
            query += ` AND os IN (${os.map(() => '?').join(', ')})`;
            params.push(...os);
        }

        if (arch && arch.length > 0) {
            query += ` AND arch IN (${arch.map(() => '?').join(', ')})`;
            params.push(...arch);
        }

        if (notest) {
            query += ` AND tested = 0`;
        }

        if (nopub) {
            query += ` AND published = 0`;
        }

        if (nopack) {
            query += ` AND packed = 0`;
        }

        query += ` ORDER BY version DESC`;

        if (pageSize > 0) {
            query += ` LIMIT ? OFFSET ?`;
            params.push(pageSize, (pageNum - 1) * pageSize);
        }

        return await this.db.all<any[]>(query, ...params);
    }

    public async getVersionCount(product: string|undefined): Promise<number> {
        if (!this.db) {
            throw new Error("Database not initialized");
        }
        let query = "SELECT COUNT(*) as count FROM versions WHERE 1=1";
        const params: any[] = [];

        if (product) {
            query += ` AND product = ?`;
            params.push(product);
        }

        const result = await this.db.get<{ count: number }>(query, ...params);
        return result.count;

    }

    public async getLatestCommit(product: string|undefined): Promise<string | undefined> {
        if (!this.db) {
            throw new Error("Database not initialized");
        }
        let query = "SELECT commit_sha FROM versions WHERE 1=1";
        const params: any[] = [];

        if (product) {
            query += " AND product = ?";
            params.push(product);
        }

        query += " ORDER BY version DESC LIMIT 1"

        const result = await this.db.get<{ commit_sha: string }>(query, ...params);
        console.log(result);
        return result?.commit_sha;
    }

    public async close() {
        await this.db!.close();
    }
}