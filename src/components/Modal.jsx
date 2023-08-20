import React from "react";

export function Modal() {
  const [showModal, setShowModal] = React.useState(true);

  return (
    <>
      {showModal ? (
        <>
          <div className="justify-center items-center flex overflow-hidden overflow-y-auto fixed inset-0 z-400 outline-none focus:outline-none font-space-mono">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className=" rounded-2xl shadow-xl relative flex flex-col w-full bg-slate-900 border-2 border-slate-700 outline-none focus:outline-none  overflow-hidden">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-700 rounded-t">
                  <h3 className="text-2xl font-semibold text-white font-space-mono">
                    Find comprehensive data on New Zealand Infrastructure
                  </h3>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-white opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>
                {/*body*/}
                <div className="relative px-6 py-4 flex-auto">
                  <p className="my-0 text-slate-300 text-md leading-relaxed font-space-mono">
                    Infra.nz is a digital twin that provides data about the
                    natural and built environment. Use it to discover and
                    manipulate aggregate information about buildings, utilities,
                    and public projects. <br />
                    <br />
                    Use your mouse to move around. Use control + click to pan
                    and tilt.
                  </p>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end border-t border-solid border-slate-700 rounded-b">
                  <button
                    className="text-purple-300 background-transparent font-bold w-full p-6 text-lg outline-none font-space-mono focus:outline-none  ease-linear transition-all duration-150 hover:bg-purple-200 rounded-md"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-300 bg-black"></div>
        </>
      ) : null}
    </>
  );
}
