import { FC, useState, useMemo } from 'react';
import { Container, SecondaryTab, Checkbox, Editor } from '@firecamp/ui-kit';
import { EEditorLanguage } from '@firecamp/types';

//@ts-ignore
import ScriptDefs from './interfaces/Scripts.d.txt?raw';
import HelpPopUp from './HelpPopup';
import { IScriptsTab } from './interfaces/Scripts.interfaces';

type TSnippets = {
  snippets: {
    pre?: any;
    post?: any;
    test?: any;
  };
};
const ScriptsTabs: FC<IScriptsTab & TSnippets> = ({
  id = '',
  scripts = {
    pre: '',
    post: '',
    test: '',
  },
  inheritScript: propInheritScript = {
    pre: true,
    post: true,
    test: true,
  },
  inheritScriptMessage = '',
  allowInherit = true,
  snippets,
  onChangeScript = () => {},
  onClickInherit = () => {},
  openParentScriptsModal = () => {},
}) => {
  const tabs = useMemo(
    () => [
      {
        id: 'pre',
        name: 'Pre',
        dotIndicator: !!scripts.pre,
      },
      {
        id: 'post',
        name: 'Post',
        dotIndicator: !!scripts.post,
      },
      /*{
        id: 'test',
        name: 'Test cases',
        dotIndicator: !!scripts.test,
      }, */
    ],
    [scripts]
  );

  const [activeTab, setActiveTab] = useState<'pre' | 'post'>('pre');

  if (!scripts || scripts[activeTab] === undefined) {
    return <span />;
  }

  const [isHelpPopupOpen, toggleHelpPopup] = useState(false);
  const [editorDOM, setEditorDOM] = useState(null);
  const [inheitedScripts, setInheitedScripts] = useState({});
  // const [isInheried, toggleInherited] = useState(propInheritScript[activeTab]);

  /*  useEffect(() => {
     _onClickInherit(propInheritScript[activeTab]);
   }, [activeTab]); */

  const _onAddScriptFromHelp = async (script = '') => {
    const _concateExisting = (
      scriptType = 'pre',
      script = '',
      concateScript = false
    ) => {
      if (!scriptType || !scripts) return;

      const existingScript = scripts[scriptType];
      let updatedScript = script;

      if (concateScript === true) {
        updatedScript = existingScript
          ? `${existingScript || ''}
      ${script || ''}`
          : `${script || ''}`;
      }

      onChangeScript(scriptType, updatedScript);
    };

    if (editorDOM && editorDOM !== null) {
      if (activeTab === 'test') {
        script = script.replace(/\n/g, '\n\t');

        if (!scripts[activeTab] || !scripts[activeTab].length) {
          const defaultScript = `describe("Untitled suite", ()=>{
        
});`;
          await editorDOM.insertTextAtCurrentCursor(defaultScript);
          editorDOM.revealLineInCenter(2);
        }

        const initCursor = await editorDOM.getPosition();
        if (initCursor.lineNumber !== 1) {
          const rowNum = initCursor.lineNumber - 1;
          editorDOM.setPosition({ column: 0, lineNumber: rowNum });
          await editorDOM.insertTextAtCurrentCursor(`\n\n\t${script}
`);
        } else if (scripts[activeTab] && scripts[activeTab].length) {
          await editorDOM.insertTextAtCurrentCursor(`\n\t${script}
`);
        } else {
          await editorDOM.insertTextAtCurrentCursor(`\n${script}
`);
        }
      } else if (scripts[activeTab] && scripts[activeTab].length) {
        await editorDOM.insertTextAtCurrentCursor(`\n${script}
`);
      } else {
        await editorDOM.insertTextAtCurrentCursor(script);
      }

      const scriptValue = await editorDOM.getValue();
      _concateExisting(activeTab, scriptValue, false);
    } else {
      _concateExisting(activeTab, script, true);
    }
  };

  const _onClickInherit = async (isChecked = false) => {
    try {
      // toggleInherited(isChecked);
      // return onClickInherit(activeTab, isChecked);

      const inherited = await onClickInherit(activeTab, isChecked);
      if (inherited && inherited !== inheitedScripts) {
        setInheitedScripts(inherited);
      }
    } catch (error) {
      console.error({ error });
    }
  };

  return (
    <Container>
      <Container.Header className="flex items-center whitespace-pre">
        <SecondaryTab
          list={tabs}
          activeTab={activeTab}
          isBgTransperant={true}
          onSelect={(tab) => {
            if (tab !== activeTab) {
              setActiveTab(tab);
            }
          }}
        />
      </Container.Header>
      <Container.Body>
        {/*  {allowInherit && propInheritScript[activeTab] ? (
          <Inherit
            message={inheritScriptMessage}
            openParentScriptsModal={openParentScriptsModal}
            parentName={inheitedScripts?.parent_name || ''}
          />
        ) : ( */}
        <div className="flex items-center ml-auto justify-end">
          {allowInherit ? (
            <Checkbox
              className={'position-top-right'}
              isChecked={propInheritScript[activeTab]}
              onToggleCheck={() =>
                _onClickInherit(!propInheritScript[activeTab])
              }
              label="Inherit from parent"
              // labelPlacing="left"
            />
          ) : (
            <span />
          )}
          {snippets[activeTab] ? (
            <HelpPopUp
              isOpen={isHelpPopupOpen}
              scriptHelpPayload={snippets[activeTab]}
              onClose={() => toggleHelpPopup(!isHelpPopupOpen)}
              onAddScript={_onAddScriptFromHelp}
            />
          ) : (
            <></>
          )}
        </div>
        <div style={{ height: '100%' }}>
          {
            // TODO: remove above parent div and height
          }
          <Editor
            autoFocus={true}
            id={`scripts-tab-${activeTab}-${id}`}
            value={scripts[activeTab] || ''}
            language={EEditorLanguage.TypeScript}
            onLoad={(editor) => {
              setEditorDOM(editor);
            }}
            onChange={({ target: { value } }) =>
              onChangeScript(activeTab, value)
            }
            addExtraLib={{
              typeDefinition: ScriptDefs,
              path: 'file:///node_modules/@firecamp/scripts/index.d.ts',
            }}
          />
        </div>
        {/* )} */}
      </Container.Body>
    </Container>
  );
};
export default ScriptsTabs;
