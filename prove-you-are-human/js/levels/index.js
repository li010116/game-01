import { CHAPTER1_LEVELS } from './ch1.js';
import { CHAPTER2_LEVELS } from './ch2.js';
import { CHAPTER3_LEVELS } from './ch3.js';
import { CHAPTER4_LEVELS } from './ch4.js';

export const LEVELS = [
  ...CHAPTER1_LEVELS,
  ...CHAPTER2_LEVELS,
  ...CHAPTER3_LEVELS,
  ...CHAPTER4_LEVELS
];

export const CHAPTERS = {
  2: {
    tag: 'CHAPTER 02 · Lv.06–10',
    name: '物理失控与感官整活',
    desc: '热身结束了。接下来迎接蚊子袭击、心理红按钮和半程 BOSS【我要验牌】！'
  },
  3: {
    tag: 'CHAPTER 03 · Lv.11–15',
    name: '规则叛变与精神污染',
    desc: '保安彻底放飞自我：地狱密码、裂变弹窗、大脑反转，甚至系统都可能……'
  },
  4: {
    tag: 'CHAPTER 04 · Lv.16–20',
    name: '碳基终极审判',
    desc: '最后 5 关！坚持住，属于纯血人类的红章鉴定证书就在终点等你！'
  }
};
