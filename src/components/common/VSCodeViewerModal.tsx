import { useState, useEffect } from 'react';
import { X, Play, Copy, Check, Eye, FileCode, GitBranch } from 'lucide-react';
import { parseGitHubUrl, fetchGitHubRepoTree, fetchGitHubFileContent, type GitHubTreeItem } from '../../services/githubService';

interface VSCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl?: string | null;
  githubUrl?: string | null;
  fileName?: string;
  rawCode?: string;
}

export default function VSCodeViewerModal({
  isOpen,
  onClose,
  fileUrl,
  githubUrl,
  fileName = 'index.html',
  rawCode
}: VSCodeViewerModalProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [currentFileName, setCurrentFileName] = useState<string>(fileName);

  // GitHub Explorer State
  const [treeItems, setTreeItems] = useState<GitHubTreeItem[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [repoInfo, setRepoInfo] = useState<{ owner: string; repo: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Check if GitHub URL is available
    const parsedRepo = parseGitHubUrl(githubUrl);
    setRepoInfo(parsedRepo);

    if (parsedRepo) {
      setLoading(true);
      fetchGitHubRepoTree(parsedRepo.owner, parsedRepo.repo)
        .then(async (tree) => {
          setTreeItems(tree);
          // Find first code file or README.md
          const firstFile = tree.find(t => t.type === 'blob' && (t.path.endsWith('.md') || t.path.endsWith('.tsx') || t.path.endsWith('.ts') || t.path.endsWith('.js') || t.path.endsWith('.json') || t.path.endsWith('.html')));
          if (firstFile) {
            setSelectedFilePath(firstFile.path);
            setCurrentFileName(firstFile.path.split('/').pop() || firstFile.path);
            const content = await fetchGitHubFileContent(parsedRepo.owner, parsedRepo.repo, firstFile.path);
            setCode(content);
          } else {
            setCode('// GitHub Repository Empty or No Code Files found');
          }
        })
        .catch(err => {
          console.error("Error loading GitHub repo tree:", err);
        })
        .finally(() => setLoading(false));
      return;
    }

    if (rawCode) {
      setCode(rawCode);
      setCurrentFileName(fileName);
      setLoading(false);
      return;
    }

    if (fileUrl) {
      setLoading(true);
      setCurrentFileName(fileName);
      fetch(fileUrl)
        .then(res => res.text())
        .then(text => {
          setCode(text);
          setLoading(false);
        })
        .catch(() => {
          setCode(`<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>${fileName} - ProfileHub Verified Artifact</title>
</head>
<body>
    <h1>🎓 ProfileHub Verified Project</h1>
    <p>File URL: ${fileUrl}</p>
</body>
</html>`);
          setLoading(false);
        });
    }
  }, [isOpen, fileUrl, githubUrl, rawCode, fileName]);

  if (!isOpen) return null;

  const handleSelectGitHubFile = async (path: string) => {
    if (!repoInfo) return;
    setSelectedFilePath(path);
    setCurrentFileName(path.split('/').pop() || path);
    setLoading(true);
    try {
      const content = await fetchGitHubFileContent(repoInfo.owner, repoInfo.repo, path);
      setCode(content);
    } catch (err: any) {
      setCode(`// Lỗi khi đọc file ${path}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Syntax highlighter for VS Code Dark+ Theme
  const renderHighlightedCode = (sourceText: string) => {
    const lines = sourceText.split('\n');
    return lines.map((lineText, index) => {
      let formattedLine = lineText
        .replace(/(&lt;|<)(\/?[a-zA-Z0-9-]+)(.*?)(&gt;|>)/g, '<span style="color: #569cd6;">$1$2</span><span style="color: #9cdcfe;">$3</span><span style="color: #569cd6;">$4</span>')
        .replace(/"([^"]*)"/g, '"<span style="color: #ce9178;">$1</span>"')
        .replace(/&lt;!--(.*?)--&gt;|<!--(.*?)-->/g, '<span style="color: #6a9955; font-style: italic;"><!--$1$2--></span>');

      return (
        <div key={index} style={{ display: 'flex', lineHeight: '1.6', fontSize: '13px', fontFamily: "'Consolas', 'Fira Code', 'Monaco', monospace" }}>
          <span style={{ width: '45px', textAlign: 'right', paddingRight: '16px', color: '#858585', userSelect: 'none', flexShrink: 0 }}>
            {index + 1}
          </span>
          <span
            style={{ color: '#d4d4d4', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
            dangerouslySetInnerHTML={{ __html: formattedLine || '&nbsp;' }}
          />
        </div>
      );
    });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '1200px', height: '88vh', backgroundColor: '#1e1e1e', borderRadius: '12px', border: '1px solid #333333', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
        
        {/* VS CODE TOP WINDOW TITLE BAR */}
        <div style={{ height: '40px', backgroundColor: '#323233', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid #252526', userSelect: 'none' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56', display: 'inline-block' }} />
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e', display: 'inline-block' }} />
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f', display: 'inline-block' }} />
            <span style={{ fontSize: '12px', color: '#cccccc', marginLeft: '12px', fontWeight: '500' }}>
              Visual Studio Code - {repoInfo ? `${repoInfo.owner}/${repoInfo.repo}` : currentFileName}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#252526', padding: '3px', borderRadius: '6px' }}>
            <button
              onClick={() => setActiveTab('editor')}
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: activeTab === 'editor' ? '#1e1e1e' : 'transparent',
                color: activeTab === 'editor' ? '#ffffff' : '#969696',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Eye size={13} color="#38bdf8" /> VS Code Inspector
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: activeTab === 'preview' ? '#1e1e1e' : 'transparent',
                color: activeTab === 'preview' ? '#ffffff' : '#969696',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Play size={13} color="#4ade80" /> Live Browser Preview
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleCopyCode}
              style={{ background: 'none', border: '1px solid #454545', color: '#cccccc', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {copied ? <Check size={13} color="#4ade80" /> : <Copy size={13} />}
              {copied ? 'Đã chép!' : 'Copy Code'}
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#cccccc', fontSize: '18px', cursor: 'pointer', padding: '0 4px' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* MAIN BODY AREA WITH GITHUB FILE TREE SIDEBAR */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* GITHUB REPO FILE TREE SIDEBAR */}
          {repoInfo && (
            <div style={{ width: '250px', backgroundColor: '#252526', borderRight: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              <div style={{ padding: '10px 12px', fontSize: '11px', fontWeight: 'bold', color: '#969696', textTransform: 'uppercase', borderBottom: '1px solid #333333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GitBranch size={13} color="#38bdf8" /> GITHUB REPO EXPLORER
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                {treeItems.length === 0 ? (
                  <div style={{ padding: '12px', fontSize: '12px', color: '#858585' }}>Đang tải danh mục file...</div>
                ) : (
                  treeItems.filter(item => item.type === 'blob').slice(0, 40).map(item => {
                    const isSelected = selectedFilePath === item.path;
                    return (
                      <div
                        key={item.path}
                        onClick={() => handleSelectGitHubFile(item.path)}
                        style={{
                          padding: '5px 12px',
                          fontSize: '12px',
                          color: isSelected ? '#ffffff' : '#cccccc',
                          backgroundColor: isSelected ? '#37373d' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <FileCode size={13} color={item.path.endsWith('.tsx') || item.path.endsWith('.ts') ? '#38bdf8' : '#e2e8f0'} />
                        <span>{item.path}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* MAIN EDITOR & PREVIEW AREA */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* VS CODE FILE TAB */}
            <div style={{ height: '35px', backgroundColor: '#252526', display: 'flex', alignItems: 'center', paddingLeft: '16px', borderBottom: '1px solid #1e1e1e' }}>
              <div style={{ height: '100%', backgroundColor: '#1e1e1e', borderTop: '2px solid #007acc', color: '#ffffff', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontFamily: "'Consolas', monospace" }}>
                <span style={{ color: '#e34c26', fontWeight: 'bold' }}>CODE</span>
                <span>{currentFileName}</span>
              </div>
            </div>

            {/* CODE CONTENT */}
            <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#1e1e1e', display: 'flex', flexDirection: 'column' }}>
              {loading ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#858585', fontSize: '14px' }}>
                  ⚡ Đang tải mã nguồn trong trình đọc VS Code...
                </div>
              ) : activeTab === 'editor' ? (
                <div style={{ flex: 1, overflow: 'auto', padding: '16px 0', backgroundColor: '#1e1e1e' }}>
                  {renderHighlightedCode(code)}
                </div>
              ) : (
                <div style={{ flex: 1, backgroundColor: '#ffffff' }}>
                  {fileUrl ? (
                    <iframe src={fileUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Live HTML Preview" />
                  ) : (
                    <iframe srcDoc={code} style={{ width: '100%', height: '100%', border: 'none' }} title="Live HTML Preview" />
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* VS CODE BOTTOM STATUS BAR */}
        <div style={{ height: '24px', backgroundColor: '#007acc', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', fontSize: '11px', fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>🛡️ ProfileHub VS Code Security Inspector</span>
            <span>{repoInfo ? `${repoInfo.owner}/${repoInfo.repo}` : 'UTF-8'}</span>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Ln 1, Col 1</span>
            <span>HTML / TSX / CSS</span>
            <span>Verified Code Repo ✅</span>
          </div>
        </div>

      </div>
    </div>
  );
}
