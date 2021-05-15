package log

// Logger is the interface to log operations
type Logger interface {
	Log(...interface{})
}

// LoggerFunc allows plain functions to be used as logger
type LoggerFunc func(...interface{})

func (f LoggerFunc) Log(v ...interface{}) {
	f(v...)
}
