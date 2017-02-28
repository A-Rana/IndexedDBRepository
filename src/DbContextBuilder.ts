namespace IndexedDB {
    export class DbContextBuilder {
        _dbName: string;
        _models: IModelConfig[] = [];
        _upgradeConfig: IDBUpgradeConfiguration;
        _isCreated: boolean = false;
        _repositories: any;
        constructor(private _dbNative: IDBFactory) {
        }

        public CreateDB(dbName: string): DbContextBuilder {
            this._dbName = dbName;
            return this;
        }

        public ConfigureModel(model: IModelConfig): DbContextBuilder {
            if (model === undefined || model === null)
                throw new Error('Please mention model detail');
            this._models.push(model);
            return this;
        }

        public UpgradeConfiguration(UpgradeConfiguration: IDBUpgradeConfiguration): DbContextBuilder {
            if (this._upgradeConfig !== undefined || this._upgradeConfig !== null)
                throw new Error('Upgrade Configuration already provided');
            this._upgradeConfig = UpgradeConfiguration;
            return this;
        }

        public Build() {
            if (this._isCreated)
                throw new Error('Context is already Build');
            var that = this;
            var object = Object.create(null);
            var container = new DbContext(this._dbNative, this._dbName);
            container.Upgrade = this._upgradeConfig;
            container.ModelBuilding = function (db: IDBDatabase) {
                for (var model of that._models) {
                    this.CreateObjectSet(db, model);
                }
            }
            for (var model of this._models) {
                object[model.name] = new BaseRepository(container, model.name);
            }
            this._repositories = object;
            this._isCreated = true;
            return object;
        }

        public GetRepositories(): any {
            if (!this._isCreated)
                throw new Error('Please build the DbContext first');
            return this._repositories;
        }

        public static Debug(flag: boolean) {
            Util.enableDebug = flag;
        }
    }
}