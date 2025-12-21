// Utilities
import { PiniaPluginContext, defineStore } from "pinia";
import { userLoginReq } from "../services/userServ";
import { type MenuInfo, type UserInfo, SystemConfig } from "../models/general";
import { getMenuList } from "../services/mainServ";

const defaultNaviList: MenuInfo[] = [];

export const useAppStore = defineStore("app", {
  state: () => ({
    usernameSave: "",
    passwordSave: "",
    remember: false,
    userInfo: {
      loggedIn: false,
      username: "",
      perName: "",
      token: "",
      id: 0,
      role: "",
      password: "",
    } as UserInfo,

    systemConfig: {
      naviList: defaultNaviList,
      showLeftMeun: false,
      leftList: defaultNaviList,
      id: null,
    } as SystemConfig,
  }),
  actions: {
    async login(username: string, password: string): Promise<void> {
  const res: any = await userLoginReq(username, password);

  // 兼容：后端可能把 personId 放在不同位置
  const personId =
    res.personId ??
    res.id ??
    res.data?.personId ??
    res.data?.id ??
    res.userInfo?.personId ??
    res.userInfo?.id;

  this.userInfo = {
    loggedIn: true,
    username: res.username ?? res.data?.username ?? username,
    perName: res.perName ?? res.data?.perName ?? "",
    token: res.token ?? res.data?.token ?? "",
    id: personId ?? 0,              // 你项目里很多地方用 userInfo.id，当作 personId 用
    role: res.role ?? res.data?.role ?? "",
    password: password,
    // 如果你愿意更清晰，就再存一份：
    // personId: personId ?? 0,
  };

  console.log("[store.login] login raw res =", res);
  console.log("[store.login] resolved personId =", personId);
},
    logout() {
      this.userInfo = {
        loggedIn: false,
        username: "",
        perName: "",
        token: "",
        role: "",
        id: 0,
        password: "",
      };
      this.systemConfig.naviList = [];
    },
    async setNavi() {
      this.systemConfig.naviList = await getMenuList();
      this.systemConfig.leftList = this.systemConfig.naviList[0].sList;
      this.systemConfig.showLeftMeun = true;
      this.systemConfig.id = this.systemConfig.naviList[0].id;
    },
    saveAccount(username: string, password: string) {
      this.usernameSave = username;
      this.passwordSave = password;
      this.remember = true;
    },
    removeAccount() {
      this.usernameSave = "";
      this.passwordSave = "";
      this.remember = false;
    },
    //选中模块菜单，设置左侧菜单数据
    setLeftList(id: number) {
      let i: number;
      for (i = 0; i < this.systemConfig.naviList.length; i++) {
        if (this.systemConfig.naviList[i].id === id) {
          this.systemConfig.leftList = this.systemConfig.naviList[i].sList;
          this.systemConfig.id = id;
          break;
        }
      }
    },
  },
  persist: {
    storage: localStorage,
    // debug: true,
    // afterRestore: (context: PiniaPluginContext) => {
    //   console.log(context);
    // },
  },
});
