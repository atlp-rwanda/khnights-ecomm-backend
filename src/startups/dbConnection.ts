import { OrmConfig } from "../configs/db_config";

const dbConnection = async () => {
  await OrmConfig.initialize()
    .then(() => {
      console.log("[db]: Database connected successfully");
    })
    .catch((error) => {
      console.log("[db]: Database connection failed");
      console.log(error);
    });
};

export { dbConnection };
