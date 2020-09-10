import React, { useState, useEffect, useRef } from "react";
import Menu from "../menu";
import Header from "../header/header";
import Footer from "../footer/footer";
import "./index.scss";

export default (props) => {
  const {
    language,
    children,
    locale,
    menuList,
    id,
    versions,
    version,
    headings,
    current,
    wrapperClass = "doc-wrapper",
    isBenchMark = false,
    showDoc = true,
  } = props;
  const formatHeadings =
    headings &&
    headings.reduce((pre, cur) => {
      const copyCur = JSON.parse(JSON.stringify(cur));
      const preHead = pre[pre.length - 1];
      if (preHead && preHead.depth < cur.depth) {
        pre[pre.length - 1].children.push(cur);
      } else {
        copyCur.children = [];
        pre = [...pre, copyCur];
      }
      return pre;
    }, []);
  const [hash, setHash] = useState(null);
  const docContainer = useRef(null);
  const [showToTopButton, setShowToTopButton] = useState(false);

  // star reference
  const star = useRef(null);
  useEffect(() => {
    if (!window) {
      return;
    }
    if (!star.current) {
      return;
    }
    const repoUrl = `https://api.github.com/repos/deepset-ai/haystack`;
    let latest = window.localStorage.getItem("milvus.io.stargazers");
    const latestFetchTime = window.localStorage.getItem(
      "milvus.io.stargazers_fetch_time"
    );

    if (
      !latestFetchTime ||
      Date.now() - latestFetchTime > 60000 * 60 ||
      !latest
    ) {
      // get
      fetch(repoUrl)
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            if (data.stargazers_count >= latest) {
              window.localStorage.setItem(
                "milvus.io.stargazers",
                data.stargazers_count
              );
              window.localStorage.setItem(
                "milvus.io.stargazers_fetch_time",
                Date.now()
              );
              star.current.innerHTML = `<i class="fab fa-github" aria-hidden="true"></i> 
                  ${data.stargazers_count}`;
            }
          }
        });
    } else {
      star.current.innerHTML = `<i class="fab fa-github" aria-hidden="true"></i> ${latest}`;
    }
  }, []);

  useEffect(() => {
    const cb = () => {
      const wrapper = document.querySelector("html");

      const showButton = wrapper.scrollTop !== 0;
      setShowToTopButton(showButton);
    };

    window.addEventListener("scroll", () => {
      cb();
    });

    return window.removeEventListener("scroll", () => {
      cb();
    });
  }, []);

  const generateAnchorMenu = (headings, className) => {
    return headings.map((v) => {
      /* eslint-disable-next-line */
      const normalVal = v.value.replace(/[.｜,｜\/｜\'｜\?｜？｜、|，]/g, "");
      const anchor = normalVal.split(" ").join("-");
      let childDom = null;
      if (v.children && v.children.length) {
        childDom = generateAnchorMenu(v.children, "child-item");
      }
      return (
        <div className={`item ${className}`} key={v.value}>
          <a
            href={`#${anchor}`}
            title={v.value}
            className={anchor === hash ? "active" : ""}
            onClick={(e) => onAnchorClick(e, anchor)}
          >
            {v.value}
          </a>
          {childDom}
        </div>
      );
    });
  };

  const onAnchorClick = (event, anchor) => {
    event.stopPropagation();
    event.preventDefault();

    setHash(anchor);

    const element = document.querySelector(`#${anchor}`);
    const offset = 62;

    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
    });
  };

  const onToTopClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div>
      <Header
        language={language}
        current={current}
        locale={locale}
        showDoc={showDoc}
      />
      <main className={wrapperClass}>
        <Menu
          menuList={menuList}
          versions={versions}
          activeDoc={id}
          version={version}
          locale={locale}
          isBenchMark={isBenchMark}
        ></Menu>
        <div
          className={`inner-container ${isBenchMark ? "fullwidth" : ""}`}
          ref={docContainer}
        >
          {children}
          {!isBenchMark && (
            <Footer locale={locale} style={{ background: "#fff" }}></Footer>
          )}
        </div>
        {formatHeadings && !isBenchMark && (
          <div className="anchor-wrapper">
            <section>
              {generateAnchorMenu(formatHeadings, "parent-item")} 
              <div className="button-container">
                <a
                  ref={star}
                  className="btn"
                  href="http://github.com/deepset-ai/haystack"
                >
                  <i
                    className="fab fa-github"
                    id="btn-star"
                    aria-hidden="true"
                  ></i>
                  4000
                </a>
                <a
                  className="btn"
                  href="https://github.com/deepset-ai/haystack/discussions"
                >
                  <i className="far fa-comments" aria-hidden="true"></i>
                  Github Discussions
                </a>
              </div>
            </section>
          </div>
        )}

        {showToTopButton && (
          <div
            className="button-to-top"
            role="button"
            onClick={onToTopClick}
            onKeyDown={onToTopClick}
            tabIndex={0}
          >
            <svg
              width="16"
              height="16"
              focusable="false"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 384 512"
              className="svg-inline--fa fa-arrow-to-top fa-w-12 fa-2x"
            >
              <path
                fill="currentColor"
                d="M24 32h336c13.3 0 24 10.7 24 24v24c0 13.3-10.7 24-24 24H24C10.7 104 0 93.3 0 80V56c0-13.3 10.7-24 24-24zm66.4 280.5l65.6-65.6V456c0 13.3 10.7 24 24 24h24c13.3 0 24-10.7 24-24V246.9l65.6 65.6c9.4 9.4 24.6 9.4 33.9 0l17-17c9.4-9.4 9.4-24.6 0-33.9L209 126.1c-9.4-9.4-24.6-9.4-33.9 0L39.5 261.6c-9.4 9.4-9.4 24.6 0 33.9l17 17c9.4 9.4 24.6 9.4 33.9 0z"
              ></path>
            </svg>
          </div>
        )}
      </main>
    </div>
  );
};