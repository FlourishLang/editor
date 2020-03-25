# flourish syntax development

Choosing lisp like systax for now since we need develop executer very small amount of time. 

	(foreach i (1..10) 
		((print i)
		 (println) )
	)

or bracketless wart like syntax 

	foreach i (range 1 10)
		print i
		println i
		
	

If statement

	ieff true
		(+ (max x y) 26)
		20

However flourish supposed to autoformat the data.

	(foreach i (100 200 200) 
		print "hell
		print 
		set a (+ 2 34)
		- 34 2
		
	)
	
	
function

	(defun (name argument1 argument2)  body)
	
So we need to restriction the people from spliting ghe line

	foreach i (1 2 3. 34. 4. 5 5 5 6 6. 6 6 7. 87 8 8 8 8. 8)


function 
		
	defun (max x y)
		ddadad
		#######
		
		
	for i (1 10)
		print (+ i 1)