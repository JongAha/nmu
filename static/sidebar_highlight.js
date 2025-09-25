// 与顶部的偏离
var TopDistance = 200;

// 获取一级标题的数量，使用not伪类过滤
var mainHeadingsNum = document.querySelectorAll(
  ".left-nav-item:not(.sub-item)"
).length;
// 对应的一级标题
let mainTitle = [];
for (let i = 1; i <= mainHeadingsNum; i++) {
  const el = document.getElementById("title" + i);
  if (el) mainTitle.push(el);
}
// 寻找所有二级标题
let subTitle = [];
for (let i = 0; i < mainHeadingsNum; i++) {
  var subHead = document.getElementById(`subtitle${i + 1}`);
  // 邻接表
  subTitle.push([]);
  if (subHead) {
    var subchildrenlen = subHead.children.length;
    for (let j = 0; j < subchildrenlen; j++) {
      subTitle[i].push(document.getElementById(`subtitle${i + 1}-${j + 1}`));
    }
  }
}

window.goTo = function (el) {
  document.documentElement.scrollTop +=
    el.getBoundingClientRect().top - TopDistance;
  console.log("元素高度为", el.getBoundingClientRect().top);
  console.log("视窗高度为", document.documentElement.scrollTop);
};
// 存储当前展开的.sub-nav元素（回调函数）
let currentOpenSubnav = null;
function Highlight(el, title, idx) {
  // 如果有二级标题，找到它
  var subtitle = document.getElementById(`subtitle${idx}`);
  // 检查当前元素是否在视窗内
  var inView =
    el.getBoundingClientRect().top < TopDistance + 1 &&
    el.getBoundingClientRect().bottom > TopDistance;
  if (inView) {
    title.classList.add("bright");
    // 如果当前的.sub-nav不是已经展开的，先关闭其他所有.sub-nav，然后展开当前的
    if (currentOpenSubnav !== subtitle) {
      // 关闭当前展开的.sub-nav（如果有）
      if (currentOpenSubnav) {
        currentOpenSubnav.classList.remove("unfold");
        setTimeout(function () {}, 600);
        currentOpenSubnav.style.display = "none";
        setTimeout(function () {}, 1000);
      }
      // 展开当前的.sub-nav
      if (subtitle) {
        subtitle.classList.add("unfold");
        setTimeout(function () {}, 600);
        subtitle.style.display = "flex";
      }
      // 更新当前展开的.sub-nav引用
      currentOpenSubnav = subtitle;
    }
  } else {
    // 如果当前标题不在视窗内，移除.bright类
    title.classList.remove("bright");
  }
}
function HighlightCheck() {
  for (let i = 0; i < mainTitle.length; i++) {
    Highlight(document.getElementById(`section${i + 1}`), mainTitle[i], i + 1);
  }
}
function SubHighlight(el, subtitle) {
  var inView =
    el.getBoundingClientRect().top < TopDistance + 1 &&
    el.getBoundingClientRect().bottom > TopDistance;
  if (inView) {
    subtitle.classList.add("bright");
  } else {
    subtitle.classList.remove("bright");
  }
}
function SubHighlightCheck() {
  for (let i = 0; i < subTitle.length; i++) {
    for (let j = 0; j < subTitle[i].length; j++) {
      // console.log(subTitle[i][j]);
      if (document.getElementById(`section${i + 1}-sub${j + 1}`)) {
        // 跳过空值
        SubHighlight(
          document.getElementById(`section${i + 1}-sub${j + 1}`),
          subTitle[i][j]
        );
      } else {
        console.log(i + 1, j + 1);
      }
    }
  }
}
window.addEventListener("scroll", HighlightCheck);
window.addEventListener("scroll", SubHighlightCheck);




// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 获取所有一级标题
  const mainNavItems = document.querySelectorAll('.left-nav-item:not(.sub-item)');
  
  // 为每个一级标题添加事件监听器
  mainNavItems.forEach(item => {
      // 鼠标悬停事件
      item.addEventListener('mouseenter', function(e) {
          // 获取当前标题的ID并提取数字部分
          const id = this.id;
          const num = id.replace('title', '');
          
          // 找到对应的二级菜单
          const subNav = document.getElementById(`subtitle${num}`);
          
          // 只有当这个二级菜单当前不是由滚动触发展开时才手动展开
          if (subNav && !subNav.classList.contains('unfold')) {
              subNav.style.display = 'flex';
              subNav.classList.add('unfold');
              // 添加一个标记，表示这是由鼠标悬停触发的
              subNav.setAttribute('data-hover-triggered', 'true');
          }
      });
      
      // 鼠标离开事件
      item.addEventListener('mouseleave', function(e) {
          // 获取当前标题的ID并提取数字部分
          const id = this.id;
          const num = id.replace('title', '');
          
          // 找到对应的二级菜单
          const subNav = document.getElementById(`subtitle${num}`);
          
          // 只有当这个展开是由鼠标悬停触发时才收起
          if (subNav && subNav.getAttribute('data-hover-triggered') === 'true') {
              // 检查当前是否在视窗内（是否需要保持展开状态）
              const section = document.getElementById(`section${num}`);
              if (section) {
                  const inView = 
                      section.getBoundingClientRect().top < TopDistance + 1 &&
                      section.getBoundingClientRect().bottom > TopDistance;
                  
                  // 如果不在视窗内，才收起
                  if (!inView) {
                      subNav.style.display = 'none';
                      subNav.classList.remove('unfold');
                      subNav.removeAttribute('data-hover-triggered');
                  }
              }
          }
      });
  });
  
  // 为二级菜单本身添加事件监听器
  const subNavs = document.querySelectorAll('.sub-nav');
  
  subNavs.forEach(subNav => {
      // 鼠标进入二级菜单
      subNav.addEventListener('mouseenter', function() {
          // 添加标记，表示这是由鼠标悬停触发的
          this.setAttribute('data-hover-triggered', 'true');
      });
      
      // 鼠标离开二级菜单
      subNav.addEventListener('mouseleave', function() {
          // 只有当这个展开是由鼠标悬停触发时才收起
          if (this.getAttribute('data-hover-triggered') === 'true') {
              // 获取对应的section ID
              const id = this.id;
              const num = id.replace('subtitle', '');
              
              // 检查当前是否在视窗内（是否需要保持展开状态）
              const section = document.getElementById(`section${num}`);
              if (section) {
                  const inView = 
                      section.getBoundingClientRect().top < TopDistance + 1 &&
                      section.getBoundingClientRect().bottom > TopDistance;
                  
                  // 如果不在视窗内，才收起
                  if (!inView) {
                      this.style.display = 'none';
                      this.classList.remove('unfold');
                      this.removeAttribute('data-hover-triggered');
                  }
              }
          }
      });
  });
  
  // 修改您的Highlight函数，在由滚动触发展开时移除hover标记
  const originalHighlight = window.Highlight;
  window.Highlight = function(el, title, idx) {
      // 调用原始函数
      originalHighlight(el, title, idx);
      
      // 获取对应的二级菜单
      const subtitle = document.getElementById(`subtitle${idx}`);
      if (subtitle && subtitle.classList.contains('unfold')) {
          // 如果是由滚动触发展开的，移除hover标记
          subtitle.removeAttribute('data-hover-triggered');
      }
  };
});